export function transition(callback: (time: number) => void, ms: number) {
    return new Promise<void>((resolve) => {
        const T = performance.now();
        function step() {
            const t = performance.now() - T;
            callback(Math.min(t / ms, 1));
            if (t < ms) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}