export const Input = {
    init(onMove) {
        // 1. Keyboard Controls Listener (Left / Right Arrows)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                onMove(-1); // Shift one lane left
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                onMove(1);  // Shift one lane right
            }
        });

        // 2. Mobile/Pointer Touch Zone Listeners
        const leftZone = document.getElementById('left-zone');
        const rightZone = document.getElementById('right-zone');

        if (leftZone && rightZone) {
            leftZone.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                onMove(-1);
            });
            rightZone.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                onMove(1);
            });
        }
    }
};
