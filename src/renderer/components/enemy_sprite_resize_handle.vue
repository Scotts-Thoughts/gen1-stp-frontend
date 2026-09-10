<template>
    <Teleport to="body" v-if="store.isDev">
        <div v-if="store.isActive && handleStyle"
            class="ePkmnSpriteResizeHandle"
            :style="handleStyle"
            @mousedown="onHandleMouseDown"
            title="Drag to resize. Arrows move (Shift = 10px). F1 flips. Enter saves, Escape cancels."></div>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useEnemySpriteResizeStore } from "~/stores/useEnemySpriteResizeStore";
import { enemySpriteScaleManager } from "~/data/enemy_sprite_scale_manager";

export default defineComponent({
    name: "EnemySpriteResizeHandle",
    data() {
        return {
            store: useEnemySpriteResizeStore(),
            _keydownHandler: null as ((e: KeyboardEvent) => void) | null,
            _mousedownHandler: null as ((e: MouseEvent) => void) | null,
        };
    },
    computed: {
        handleStyle(): Record<string, string> | null {
            // eslint-disable-next-line no-unused-expressions
            enemySpriteScaleManager.version;
            const slot = this.store.resize.slot;
            if (slot == null) return null;
            const sprite = document.querySelector(`.ePkmnSprite[data-enemy-slot="${slot}"]`);
            if (!sprite) return null;
            const rect = (sprite as HTMLElement).getBoundingClientRect();
            return {
                left: (rect.right - 8) + "px",
                top:  (rect.bottom - 8) + "px",
            };
        },
    },
    methods: {
        getZoomFactor(): number {
            // gen1 sets webContents.setZoomFactor to fit 1920×1080 into the window —
            // mouse deltas come in pre-zoom viewport pixels, but the design space the
            // sprite lives in is post-zoom. Cancel the zoom out so dragging tracks
            // the visible sprite 1-to-1.
            try {
                const z = (window as any).electron?.webFrame?.getZoomFactor?.();
                if (typeof z === "number" && z > 0) return z;
            } catch (e) { /* fall through */ }
            return 1;
        },
        onHandleMouseDown(event: MouseEvent) {
            if (!this.store.isActive) return;
            event.preventDefault();
            event.stopPropagation();
            const species = this.store.resize.species!;
            const baseSize = this.store.resize.baseSize;
            const startScale = enemySpriteScaleManager.getScale(species);
            const startWidth = baseSize * startScale;
            const startX = event.clientX;
            const startY = event.clientY;
            const zoom = this.getZoomFactor();
            const onMove = (ev: MouseEvent) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const delta = (dx + dy) / 2;
                const designDelta = zoom > 0 ? delta / zoom : delta;
                const newWidth = Math.max(20, startWidth + designDelta);
                const newScale = newWidth / baseSize;
                this.store.setLiveScale(species, newScale);
            };
            const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        },
    },
    mounted() {
        if (!this.store.isDev) return;

        this._keydownHandler = (e: KeyboardEvent) => {
            // Style mode owns Enter/Backspace/Escape; arrows/F1 fall through to nudge/flip.
            if (this.store.style_mode_active) {
                if (e.key === "Enter")     { e.preventDefault(); this.store.styleModeAdvance(); return; }
                if (e.key === "Backspace") { e.preventDefault(); this.store.styleModeBack();    return; }
                if (e.key === "Escape")    { e.preventDefault(); this.store.exitStyleMode();   return; }
            }
            if (!this.store.isActive) return;
            if (e.key === "Enter")           { e.preventDefault(); this.store.commit(); }
            else if (e.key === "Escape")     { e.preventDefault(); this.store.cancel(); }
            else if (e.key === "ArrowUp")    { e.preventDefault(); this.store.nudgeY(e.shiftKey ? -10 : -1); }
            else if (e.key === "ArrowDown")  { e.preventDefault(); this.store.nudgeY(e.shiftKey ?  10 :  1); }
            else if (e.key === "ArrowLeft")  { e.preventDefault(); this.store.nudgeX(e.shiftKey ? -10 : -1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); this.store.nudgeX(e.shiftKey ?  10 :  1); }
            else if (e.key === "F1")         { e.preventDefault(); this.store.toggleFlip(); }
        };
        // Capture-phase so we receive the click even if a higher overlay sits on top.
        this._mousedownHandler = (e: MouseEvent) => {
            if (!e.ctrlKey || e.button !== 0) return;
            const els = document.elementsFromPoint(e.clientX, e.clientY);
            const sprite = els.find((el: any) => el && el.classList && el.classList.contains("ePkmnSprite")) as HTMLElement | undefined;
            if (!sprite) return;
            const slotRaw = sprite.dataset.enemySlot;
            const species = sprite.dataset.enemySpecies;
            const slot = slotRaw != null ? parseInt(slotRaw, 10) : NaN;
            if (!species || Number.isNaN(slot)) return;
            e.preventDefault();
            e.stopPropagation();
            this.store.beginFromClick(slot, species);
        };
        window.addEventListener("keydown", this._keydownHandler);
        window.addEventListener("mousedown", this._mousedownHandler, true);
    },
    beforeUnmount() {
        if (this._keydownHandler)   window.removeEventListener("keydown", this._keydownHandler);
        if (this._mousedownHandler) window.removeEventListener("mousedown", this._mousedownHandler, true);
    },
});
</script>
