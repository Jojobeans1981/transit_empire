export const Viewport = {
    width: 0,
    height: 0,
    laneCount: 3,
    laneWidth: 0,

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.resize();

        // Listen for screen size shifts to handle responsive rescaling
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const container = document.getElementById('game-container');
        if (!container) return;

        // Sync internal drawing pixels to matching bounding box layouts
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Split the concrete roadway into 3 perfectly equal lanes
        this.laneWidth = this.width / this.laneCount;
    }
};
