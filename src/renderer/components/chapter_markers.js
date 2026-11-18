import { sendObsChapterMarker } from "~/logic/obs";

/**
 * gen1's chapter markers beyond IN / OUT / RESET / BLACKOUT (2026-10-29): the ones gen2 writes
 * and Cutter reads, ported to gen1's mapper vocabulary. The model is gen2's `app/frontend.js`
 * (grep `sendObsChapterMarker`). Called at the end of `frontend.js` `mounted`; `vm` is that
 * component. The unified frontend has the same logic in `games/gen1/markerHooks.ts`.
 *
 * What gen1 has no property for, and so does not write: `Held Item - ...` (gen1 has no held
 * items), `Special - ...` (gen2-scripted). Not written on purpose: an OUT for a wild battle,
 * because gen2 has none either (Cutter closes `IN - Wild` at the next `Enemy Fainted`).
 *
 * Differences from gen2, all because gen1's RAM differs:
 * - `Text Box` follows `screen.wFontLoaded` (bit 0: the font tiles are in VRAM, which
 *   `DisplayTextID` sets while a dialogue or start-menu box is up and closing it clears).
 *   gen2's `vRamState.text_box` has no gen1 twin; this is the nearest property.
 * - The bag is the 20 slots of `player.items`, and TMs and HMs are bag items named
 *   `TM27: Fissure`, written `Item - TM27 Fissure` as gen2 does. Names keep the mapper's
 *   upper case (`HP UP`).
 * - `Battle Level Up` and `Level Up - n` fire only on a +1 of the same party slot. gen2's
 *   `Battle Level Up` fires on every change of the battler's level, i.e. on every switch-in.
 * - `Turn` counts `patch.battle_info.turns.playerTurns` / `enemyTurns` (cumulative patch
 *   counters), where gen2 has per-battle `battle.info.*TurnTaken`. Only increments fire.
 *
 * Every subscription is optional-chained so a mapper that lacks a property loses that marker
 * and nothing else.
 */

// The strings Cutter reads, byte for byte.
const MARKERS = {
    wildIn: () => "IN - Wild",
    mapChange: (map) => `Map Change - ${map}`,
    textBox: (open) => `Text Box - ${open}`,
    item: (name) => `Item - ${name}`,
    newMove: (name) => `New Move - ${name}`,
    rareCandy: () => "Rare Candy Used",
    levelUp: (level) => `Level Up - ${level}`,
    battleLevelUp: () => "Battle Level Up",
    turn: () => "Turn",
    nextPokemon: () => "Next Pokemon",
    enemyFainted: () => "Enemy Fainted",
};

export function installChapterMarkerHooks(vm) {
    const props = () => vm.mapper.properties;
    const send = (chapterName) => {
        console.log("Chapter Detected: " + chapterName);
        sendObsChapterMarker(chapterName);
    };
    const state = () => props().meta?.state?.value;

    // A reset or a save load repopulates the bag and the party from empty, which looks like a
    // run of pickups and new moves. The playerId flips to 0 and back; the Item markers stand
    // down for a while after either edge (gen2's RESET_MARKER_GRACE_MS).
    const RESET_MARKER_GRACE_MS = 6000;
    let lastResetAt = 0;
    props().player.playerId?.change((newProp, oldProp) => {
        if ((newProp.value == 0) !== ((oldProp?.value ?? 0) == 0)) lastResetAt = Date.now();
    });
    const withinResetGrace = () => Date.now() - lastResetAt < RESET_MARKER_GRACE_MS;

    // WILD BATTLE START - the same edge as a trainer's IN (frontend.js `mounted`), when the type is Wild.
    props().meta.state.change((newProp, oldProp) => {
        if (newProp.value == "To Battle" && oldProp.value == "Overworld" && props().battle.type.value == "Wild") {
            send(MARKERS.wildIn());
        }
    });

    // MAP CHANGE
    props().overworld?.map?.change((newProp) => send(MARKERS.mapChange(String(newProp.value))));

    // TEXT BOX
    props().screen?.wFontLoaded?.change((newProp) => send(MARKERS.textBox(String(newProp.value))));

    // RARE CANDY USED (gen2's queued pairing, Overlay.vue "RARE CANDY USED CHAPTER MARKER")
    // Fires when, in the Overworld, the total Rare Candy count drops and the lead's level then
    // rises by 1. The count drops the moment the candy is used; the level can lag it by the
    // "grew to level N" text, so each decrement is queued and a later lead level-up consumes
    // the oldest one still inside a generous look-back window, keeping the pairing 1:1.
    const BAG_SLOTS = 20;
    const pendingCandyDecrements = []; // timestamps of decrements awaiting their level-up
    let recentLeadLevelUpAt = 0;                 // for the rare case the level-up is reported first
    const CANDY_LOOKBACK_MS = 5000;
    const CANDY_REVERSE_GRACE_MS = 750;
    const fireCandyUsed = () => send(MARKERS.rareCandy());

    const onCandyDecrement = (amount) => {
        const now = Date.now();
        if (recentLeadLevelUpAt && now - recentLeadLevelUpAt <= CANDY_REVERSE_GRACE_MS && state() === "Overworld") {
            recentLeadLevelUpAt = 0;
            amount -= 1;
            fireCandyUsed();
        }
        for (let k = 0; k < amount; k++) pendingCandyDecrements.push(now);
    };
    const onLeadLevelUp = () => {
        if (state() !== "Overworld") return;
        const now = Date.now();
        while (pendingCandyDecrements.length && now - pendingCandyDecrements[0] > CANDY_LOOKBACK_MS) {
            pendingCandyDecrements.shift();
        }
        if (pendingCandyDecrements.length) {
            pendingCandyDecrements.shift();
            fireCandyUsed();
        } else {
            recentLeadLevelUpAt = now;
        }
    };
    // Summing the quantity over every slot named Rare Candy survives slot reshuffles (using the
    // last candy empties its slot and shifts the rest up; the sum still goes N -> N-1).
    const readRareCandyCount = () => {
        let total = 0;
        const bag = props().player?.items;
        if (bag) {
            for (let i = 0; i < BAG_SLOTS; i++) {
                if (bag[i]?.item?.value === "RARE CANDY") total += bag[i]?.quantity?.value ?? 0;
            }
        }
        return total;
    };
    let lastRareCandyCount = readRareCandyCount();
    let candyCheckTimer = null;
    const checkCandyCount = () => {
        const current = readRareCandyCount();
        if (current < lastRareCandyCount) onCandyDecrement(lastRareCandyCount - current);
        lastRareCandyCount = current;
    };
    // Debounced 100 ms for the same cascading-slot-shift reason as the item watcher below.
    const scheduleCandyCheck = () => {
        if (candyCheckTimer) clearTimeout(candyCheckTimer);
        candyCheckTimer = setTimeout(() => {
            candyCheckTimer = null;
            checkCandyCount();
        }, 100);
    };
    props().player.team?.[0]?.level?.change((newProp, oldProp) => {
        if ((newProp?.value ?? 0) === (oldProp?.value ?? 0) + 1) onLeadLevelUp();
    });

    // LEVEL UP / BATTLE LEVEL UP (the battler's level, +1 of the same party slot only)
    // A switch-in rewrites the battler struct, level included, so a level that is one higher
    // than the last battler's would look like a level-up. The slot and species change in the
    // same poll, in no fixed order; deciding 120 ms late lets both land before the guard looks.
    const SWITCH_GUARD_BEFORE_MS = 300;
    const SWITCH_GUARD_WAIT_MS = 120;
    let lastBattlerShiftAt = 0;
    const noteBattlerShift = () => { lastBattlerShiftAt = Date.now(); };
    props().battle?.yourPokemon?.partyPos?.change(noteBattlerShift);
    props().battle?.yourPokemon?.species?.change(noteBattlerShift);
    props().battle?.yourPokemon?.level?.change((newProp, oldProp) => {
        if ((newProp?.value ?? 0) !== (oldProp?.value ?? 0) + 1) return;
        const at = Date.now();
        const gameState = state();
        if (gameState !== "Battle" && gameState !== "From Battle") return;
        const level = String(newProp.value);
        setTimeout(() => {
            if (lastBattlerShiftAt > at - SWITCH_GUARD_BEFORE_MS) return;
            if (gameState === "Battle") send(MARKERS.battleLevelUp());
            send(MARKERS.levelUp(level));
        }, SWITCH_GUARD_WAIT_MS);
    });

    // BAG: CRITICAL ITEMS (gen2 "CRITICAL ITEM CHAPTER MARKERS", docs/CRITICAL_ITEM_CHAPTER_MARKER.md)
    // Fires "Item - <name>" when the player gains a vitamin, Rare Candy or PP Up, or a TM, or
    // HM03 Surf. Counting by quantity makes a restock fire (Rare Candy x3 -> x4), where a name
    // check would fire once ever; a TM fires only when the bag had none of it.
    const vitaminItems = new Set(["HP UP", "PROTEIN", "IRON", "CARBOS", "CALCIUM", "PP UP", "RARE CANDY"]);
    const isTmOrSurf = (name) => /^TM\d+: /.test(name) || name === "HM03: Surf";
    const isCriticalBagItem = (name) => vitaminItems.has(name) || isTmOrSurf(name);
    // "TM27: Fissure" -> "TM27 Fissure", as gen2's "TM27-Return" -> "TM27 Return".
    const markerItemName = (name) => isTmOrSurf(name) ? name.replace(": ", " ") : name;

    const readOwnedItemCounts = () => {
        const counts = new Map();
        const bag = props().player?.items;
        if (bag) {
            for (let i = 0; i < BAG_SLOTS; i++) {
                const name = bag[i]?.item?.value;
                const quantity = bag[i]?.quantity?.value ?? 0;
                if (name == null || name === "" || quantity <= 0) continue;
                counts.set(name, (counts.get(name) ?? 0) + quantity);
            }
        }
        return counts;
    };

    // Moving an item (SELECT swap, PC deposit then withdraw) is a loss then a gain. A loss is
    // banked for MOVE_GRACE_MS and netted against the next gain, so a shuffle is not a pickup;
    // a real pickup has no loss to cancel it.
    const MOVE_GRACE_MS = 2000;
    const decrementCredit = new Map(); // name -> [{ qty, at }] of recent unmatched losses
    let lastOwnedCounts = readOwnedItemCounts();
    let ownedCheckTimer = null;
    const checkForNewOwnedItems = () => {
        const now = Date.now();
        const current = readOwnedItemCounts();
        // The bag reloads from 0 after a reset or load; re-baseline and fire nothing.
        if (withinResetGrace()) { lastOwnedCounts = current; return; }
        const names = new Set([...current.keys(), ...lastOwnedCounts.keys()]);
        for (const name of names) {
            if (!isCriticalBagItem(name)) continue;
            const before = lastOwnedCounts.get(name) ?? 0;
            const delta = (current.get(name) ?? 0) - before;
            if (delta === 0) continue;
            if (delta < 0) {
                const credits = decrementCredit.get(name) ?? [];
                credits.push({ qty: -delta, at: now });
                decrementCredit.set(name, credits);
                continue;
            }
            let gain = delta;
            const credits = decrementCredit.get(name);
            if (credits) {
                while (credits.length && gain > 0) {
                    if (now - credits[0].at > MOVE_GRACE_MS) { credits.shift(); continue; }
                    const used = Math.min(gain, credits[0].qty);
                    gain -= used;
                    credits[0].qty -= used;
                    if (credits[0].qty === 0) credits.shift();
                }
                if (!credits.length) decrementCredit.delete(name);
            }
            if (gain > 0 && !(isTmOrSurf(name) && before > 0)) send(MARKERS.item(markerItemName(name)));
        }
        lastOwnedCounts = current;
    };
    const scheduleOwnedCheck = () => {
        if (ownedCheckTimer) clearTimeout(ownedCheckTimer);
        ownedCheckTimer = setTimeout(() => {
            ownedCheckTimer = null;
            checkForNewOwnedItems();
        }, 100);
    };
    for (let i = 0; i < BAG_SLOTS; i++) {
        props().player.items?.[i]?.item?.change(() => { scheduleCandyCheck(); scheduleOwnedCheck(); });
        props().player.items?.[i]?.quantity?.change(() => { scheduleCandyCheck(); scheduleOwnedCheck(); });
    }

    // NEW MOVE (gen2 "NEW MOVE LEARNED CHAPTER MARKER", docs/NEW_MOVE_CHAPTER_MARKER.md)
    // In battle the moves come from the battler, otherwise from the lead. A new move is a
    // multiset diff of exactly one added move with at least one before, which filters out
    // resets, lead swaps (species differs) and the first starter.
    const readMoveContext = () => {
        const source = state() === "Battle" ? props().battle?.yourPokemon : props().player?.team?.[0];
        if (!source) return { species: null, moves: [null, null, null, null] };
        return {
            species: source.species?.value ?? null,
            moves: [
                source.move1?.value ?? null,
                source.move2?.value ?? null,
                source.move3?.value ?? null,
                source.move4?.value ?? null,
            ],
        };
    };
    let lastMoveContext = readMoveContext();
    let moveCheckTimer = null;
    const checkForNewMove = () => {
        const previous = lastMoveContext;
        const current = readMoveContext();
        lastMoveContext = current;
        if (previous.species !== current.species) return;
        if (withinResetGrace()) return;

        const count = (moves) => {
            const counts = {};
            moves.filter((move) => move != null && move !== "").forEach((move) => { counts[move] = (counts[move] || 0) + 1; });
            return counts;
        };
        const oldCounts = count(previous.moves);
        const newCounts = count(current.moves);
        const added = [];
        for (const move of Object.keys(newCounts)) {
            const diff = newCounts[move] - (oldCounts[move] || 0);
            for (let i = 0; i < diff; i++) added.push(move);
        }
        if (Object.values(oldCounts).reduce((a, b) => a + b, 0) >= 1 && added.length === 1) send(MARKERS.newMove(added[0]));
    };
    // Debounced so the four slots changing together collapse into one diff against the snapshot.
    const scheduleMoveCheck = () => {
        if (moveCheckTimer) clearTimeout(moveCheckTimer);
        moveCheckTimer = setTimeout(() => {
            moveCheckTimer = null;
            checkForNewMove();
        }, 100);
    };
    for (const slot of ["move1", "move2", "move3", "move4"]) {
        props().player.team?.[0]?.[slot]?.change(scheduleMoveCheck);
        props().battle?.yourPokemon?.[slot]?.change(scheduleMoveCheck);
    }

    // TURN (Battle only): a turn counter went up. A counter that drops, or a stale one, is not a turn.
    const fireTurnMarker = (newProp, oldProp) => {
        if (state() !== "Battle") return;
        if ((newProp?.value ?? 0) <= (oldProp?.value ?? 0)) return;
        send(MARKERS.turn());
    };
    props().patch?.battle_info?.turns?.playerTurns?.change(fireTurnMarker);
    props().patch?.battle_info?.turns?.enemyTurns?.change(fireTurnMarker);

    // NEXT POKEMON (Battle only): the enemy's party position changed.
    props().battle?.enemyPokemon?.partyPos?.change((newProp, oldProp) => {
        if (state() !== "Battle") return;
        if (newProp?.value === oldProp?.value) return;
        send(MARKERS.nextPokemon());
    });

    // ENEMY FAINTED (Battle only): the enemy's HP reached 0.
    props().battle?.enemyPokemon?.hp?.change((newProp, oldProp) => {
        if (state() !== "Battle") return;
        if (newProp?.value !== 0) return;
        if (oldProp?.value === 0) return;
        send(MARKERS.enemyFainted());
    });
}
