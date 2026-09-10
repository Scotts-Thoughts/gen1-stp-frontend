/**
 * Enemy Sprite Scale Manager
 *
 * Per-species { scale, xOffset, yOffset, flipped } applied to enemy sprites in
 * the overlay. Edited via the in-app resize tool (Ctrl+Click an enemy sprite),
 * stored in enemy_sprite_scales.json so the saved values ship with the build.
 *
 * Lookup order:
 *   1. localStorage user override (`enemyScale_<Species>`) — live in-session edits
 *   2. enemy_sprite_scales.json (bundled at build time, rewritten in dev)
 *   3. defaults (scale 1, offsets 0, flipped false)
 *
 * Persistence:
 *   - In dev (npm run dev): commit() writes back to the source JSON via fs.
 *   - In a packaged build: commit() falls back to localStorage (read-only file).
 */

import { reactive } from "vue";
import bundledScales from "./enemy_sprite_scales.json";

export interface EnemySpriteEntry {
    scale: number;
    xOffset: number;
    yOffset: number;
    flipped: boolean;
}

const DEFAULTS: EnemySpriteEntry = { scale: 1, xOffset: 0, yOffset: 0, flipped: false };

function normalize(raw: any): EnemySpriteEntry {
    if (raw == null) return { ...DEFAULTS };
    if (typeof raw === "number") return { ...DEFAULTS, scale: raw };
    if (typeof raw === "object") {
        return {
            scale:   typeof raw.scale   === "number" && !Number.isNaN(raw.scale)   ? raw.scale   : 1,
            xOffset: typeof raw.xOffset === "number" && !Number.isNaN(raw.xOffset) ? raw.xOffset : 0,
            yOffset: typeof raw.yOffset === "number" && !Number.isNaN(raw.yOffset) ? raw.yOffset : 0,
            flipped: !!raw.flipped,
        };
    }
    return { ...DEFAULTS };
}

function speciesKey(species: any): string | null {
    if (species == null) return null;
    if (typeof species === "object" && "value" in species) {
        const v = (species as any).value;
        return v == null ? null : String(v);
    }
    const s = String(species);
    return s.length > 0 ? s : null;
}

/**
 * Reactive registry. Reading `version` inside a component forces re-evaluation
 * when scales/offsets/flip change live during dragging.
 */
const state = reactive({
    scales: { ...(bundledScales as Record<string, any>) } as Record<string, EnemySpriteEntry>,
    version: 0,
});

// Normalize the bundled scales on first load.
for (const key of Object.keys(state.scales)) {
    state.scales[key] = normalize(state.scales[key]);
}

const IS_DEV: boolean = (() => {
    try {
        // import.meta.env.DEV is provided by Vite; defaults to false in packaged builds.
        return !!(import.meta as any).env?.DEV;
    } catch (e) {
        return false;
    }
})();

function readOverride(key: string): EnemySpriteEntry | null {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(`enemyScale_${key}`);
    if (raw == null || raw === "") return null;
    try {
        return normalize(JSON.parse(raw));
    } catch (e) {
        const n = parseFloat(raw);
        if (!Number.isNaN(n)) return { ...DEFAULTS, scale: n };
        return null;
    }
}

function writeOverride(key: string, entry: EnemySpriteEntry | null): void {
    if (typeof localStorage === "undefined") return;
    if (entry == null) {
        localStorage.removeItem(`enemyScale_${key}`);
    } else {
        localStorage.setItem(`enemyScale_${key}`, JSON.stringify(entry));
    }
}

function entryFor(species: any): EnemySpriteEntry {
    // Touch reactive version so consumers re-run when the version bumps.
    // eslint-disable-next-line no-unused-expressions
    state.version;
    const key = speciesKey(species);
    if (!key) return { ...DEFAULTS };
    const override = readOverride(key);
    if (override) return override;
    return state.scales[key] ?? { ...DEFAULTS };
}

export const enemySpriteScaleManager = {
    get(species: any): EnemySpriteEntry { return entryFor(species); },
    getScale(species: any): number    { return entryFor(species).scale; },
    getXOffset(species: any): number  { return entryFor(species).xOffset; },
    getYOffset(species: any): number  { return entryFor(species).yOffset; },
    getFlipped(species: any): boolean { return entryFor(species).flipped; },

    /** Update the in-session entry (localStorage). Does not touch the file. */
    setLive(species: any, partial: Partial<EnemySpriteEntry>): void {
        const key = speciesKey(species);
        if (!key) return;
        const current = entryFor(species);
        const merged = normalize({ ...current, ...partial });
        writeOverride(key, merged);
        state.version++;
    },

    /**
     * Commit the current entry for a species: in dev, write to the source JSON;
     * in prod, keep the override in localStorage. Clears the live override on
     * dev success so the bundled value becomes authoritative.
     */
    commit(species: any): void {
        const key = speciesKey(species);
        if (!key) return;
        const current = entryFor(species);
        state.scales[key] = current;
        state.version++;

        if (IS_DEV) {
            try {
                const fs = require("fs");
                const path = require("path");
                // electron-vite dev launches with cwd = project root.
                const filePath = path.resolve(process.cwd(), "src/renderer/data/enemy_sprite_scales.json");
                fs.writeFileSync(filePath, JSON.stringify(state.scales, null, 4) + "\n", "utf8");
                writeOverride(key, null);
            } catch (e) {
                console.error("[enemySpriteScaleManager] dev-mode write failed:", e);
            }
        } else {
            // Packaged builds can't rewrite the bundled JSON — persist as override.
            writeOverride(key, current);
        }
    },

    /** Drop any live override for a species (used when canceling). */
    clearOverride(species: any): void {
        const key = speciesKey(species);
        if (!key) return;
        writeOverride(key, null);
        state.version++;
    },

    get isDev(): boolean { return IS_DEV; },

    /** Used by the resize handle to react to live drags. */
    get version(): number { return state.version; },
};
