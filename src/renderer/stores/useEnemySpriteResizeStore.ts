/**
 * Pinia store wrapping the enemy sprite resize tool.
 *
 *   Ctrl+Click an enemy sprite (dev mode only) to enter resize mode.
 *   - Drag the corner handle to scale.
 *   - Arrow keys move (Shift = ±10px); F1 toggles horizontal flip.
 *   - Enter saves to data/enemy_sprite_scales.json; Escape cancels.
 *
 * Packaged builds just consume the bundled JSON read-only — the global
 * listeners and the floating handle are only mounted when in dev.
 */

import { defineStore } from "pinia";
import PokeData from "../logic/PokeData";
import { enemySpriteScaleManager } from "../data/enemy_sprite_scale_manager";

interface ResizeState {
    species: string | null;
    slot: number | null;
    baseSize: number;
}

const BASE_SIZE = 108;
const EMPTY: ResizeState = { species: null, slot: null, baseSize: BASE_SIZE };

const STYLES_ENABLED_KEY = "enemy_sprite_styles_enabled";

function loadStylesEnabled(): boolean {
    if (typeof localStorage === "undefined") return true;
    const raw = localStorage.getItem(STYLES_ENABLED_KEY);
    if (raw == null) return true;
    return raw !== "false";
}

export const useEnemySpriteResizeStore = defineStore("enemy_sprite_resize", {
    state: (): {
        resize: ResizeState;
        styles_enabled: boolean;
        style_mode_active: boolean;
        style_mode_index: number;
        style_mode_species_list: string[];
    } => ({
        resize: { ...EMPTY },
        // Dev-only opt-out so footage stays congruent with content filmed before
        // the resize feature shipped. Packaged builds ignore this flag.
        styles_enabled: loadStylesEnabled(),
        // Style Mode (dev only): iterate every species returned by
        // PokeData.getAllSpecieNames() showing each in slot 0 with the resize
        // handle active. Enter commits + advances; Backspace discards + steps
        // back.
        style_mode_active: false,
        style_mode_index: 0,
        style_mode_species_list: [],
    }),
    getters: {
        isActive: (state) => state.resize.species != null,
        isDev: () => enemySpriteScaleManager.isDev,
        /** True when sprites should render with the resize/offset/flip styles applied. */
        stylesActive(state): boolean {
            // In Style Mode we always render styles (the user is editing them).
            if (state.style_mode_active) return true;
            return !enemySpriteScaleManager.isDev || state.styles_enabled;
        },
        styleModeCurrentSpecies(state): string | null {
            if (!state.style_mode_active) return null;
            return state.style_mode_species_list[state.style_mode_index] ?? null;
        },
    },
    actions: {
        /** Read-only accessors used by the sprite templates. */
        getScale(species: any): number    { return enemySpriteScaleManager.getScale(species); },
        getXOffset(species: any): number  { return enemySpriteScaleManager.getXOffset(species); },
        getYOffset(species: any): number  { return enemySpriteScaleManager.getYOffset(species); },
        getFlipped(species: any): boolean { return enemySpriteScaleManager.getFlipped(species); },
        /** Combined transform string ready to drop into a :style binding. */
        transformFor(species: any): string {
            if (!this.stylesActive) return "none";
            const s = this.getScale(species);
            const x = this.getXOffset(species);
            const y = this.getYOffset(species);
            const sx = this.getFlipped(species) ? -s : s;
            return `translate(${x}px, ${y}px) scale(${sx}, ${s})`;
        },
        setStylesEnabled(value: boolean): void {
            this.styles_enabled = value;
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(STYLES_ENABLED_KEY, value ? "true" : "false");
            }
        },

        beginFromClick(slot: number, species: string): void {
            this.resize = { species, slot, baseSize: BASE_SIZE };
        },
        nudgeY(deltaPx: number): void {
            if (!this.resize.species) return;
            const cur = enemySpriteScaleManager.getYOffset(this.resize.species);
            enemySpriteScaleManager.setLive(this.resize.species, { yOffset: cur + deltaPx });
        },
        nudgeX(deltaPx: number): void {
            if (!this.resize.species) return;
            const cur = enemySpriteScaleManager.getXOffset(this.resize.species);
            enemySpriteScaleManager.setLive(this.resize.species, { xOffset: cur + deltaPx });
        },
        toggleFlip(): void {
            if (!this.resize.species) return;
            const cur = enemySpriteScaleManager.getFlipped(this.resize.species);
            enemySpriteScaleManager.setLive(this.resize.species, { flipped: !cur });
        },
        setLiveScale(species: string, scale: number): void {
            enemySpriteScaleManager.setLive(species, { scale });
        },
        commit(): void {
            if (!this.resize.species) return;
            enemySpriteScaleManager.commit(this.resize.species);
            this.resize = { ...EMPTY };
        },
        cancel(): void {
            if (!this.resize.species) return;
            enemySpriteScaleManager.clearOverride(this.resize.species);
            this.resize = { ...EMPTY };
        },

        // === Style Mode actions ==============================================
        _styleModeFocusCurrent(): void {
            const species = this.style_mode_species_list[this.style_mode_index];
            if (!species) return;
            this.resize = { species, slot: 0, baseSize: BASE_SIZE };
        },
        enterStyleMode(): void {
            if (!enemySpriteScaleManager.isDev) return;
            let list: string[] = [];
            try {
                list = PokeData.getAllSpecieNames().filter((n) => n && n !== "Egg" && n !== "—");
            } catch (e) {
                // PokeData.setGame must run first. Bail quietly if it hasn't.
                return;
            }
            if (list.length === 0) return;
            this.style_mode_species_list = list;
            this.style_mode_index = 0;
            this.style_mode_active = true;
            this._styleModeFocusCurrent();
        },
        exitStyleMode(): void {
            const species = this.styleModeCurrentSpecies;
            if (species) enemySpriteScaleManager.clearOverride(species);
            this.style_mode_active = false;
            this.style_mode_species_list = [];
            this.style_mode_index = 0;
            this.resize = { ...EMPTY };
        },
        styleModeAdvance(): void {
            if (!this.style_mode_active) return;
            const species = this.styleModeCurrentSpecies;
            if (species) enemySpriteScaleManager.commit(species);
            if (this.style_mode_index + 1 >= this.style_mode_species_list.length) {
                this.exitStyleMode();
                return;
            }
            this.style_mode_index++;
            this._styleModeFocusCurrent();
        },
        styleModeBack(): void {
            if (!this.style_mode_active) return;
            const species = this.styleModeCurrentSpecies;
            if (species) enemySpriteScaleManager.clearOverride(species);
            if (this.style_mode_index === 0) {
                this._styleModeFocusCurrent();
                return;
            }
            this.style_mode_index--;
            this._styleModeFocusCurrent();
        },
    },
});
