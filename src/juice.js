export const Juice = {
    popups: [],

    spawn(x, y, text, color) {
        this.popups.push({
            x: x + Math.random() * 20 - 10, // Slight horizontal randomization scramble
            y: y - 10,
            text: text,
            color: color,
            alpha: 1.0,
            scale: 1.2
        });
    },

    update(dt) {
        // Reverse loop mutation pass to handle clean deletion indexes
        for (let i = this.popups.length - 1; i >= 0; i--) {
            let p = this.popups[i];
            
            p.y -= 45 * dt; // Float upward smoothly
            p.alpha -= 1.6 * dt; // Fading speed calculation
            p.scale += 0.2 * dt; // Slight expansion swell

            if (p.alpha <= 0) {
                this.popups.splice(i, 1);
            }
        }
    },

    render(ctx) {
        ctx.save();
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "center";

        for (let p of this.popups) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            
            // Draw text shadow drop for high readability on dark asphalt
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillText(p.text, p.x + 1, p.y + 1);

            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        }
        ctx.restore();
    }
};
