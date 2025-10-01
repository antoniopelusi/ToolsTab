class DynamicBackground {
    timeColors = [
        { hour: 0, color: "#1c304b" },
        { hour: 3, color: "#41405d" },
        { hour: 6, color: "#f3ae5d" },
        { hour: 9, color: "#74c3e1" },
        { hour: 12, color: "#57b0d9" },
        { hour: 15, color: "#6d9cc3" },
        { hour: 18, color: "#e48959" },
        { hour: 21, color: "#314867" },
    ];

    updateBackground() {
        const enabled = localStorage.getItem("dynamicBackground") === "true";
        const customColor = (
            localStorage.getItem("customBackgroundColor") || ""
        ).trim();

        document.body.style.removeProperty("background");
        if (!enabled) {
            if (this.isValidHexColor(customColor)) {
                document.body.style.backgroundColor = customColor;
            } else {
                document.body.style.backgroundColor = "var(--color-background)";
                if (customColor)
                    localStorage.setItem("customBackgroundColor", "");
            }
            return;
        }

        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;

        let i = 0;
        while (
            i < this.timeColors.length - 1 &&
            hour >= this.timeColors[i + 1].hour
        ) {
            i++;
        }

        const curr = this.timeColors[i];
        const next = this.timeColors[i + 1] || {
            hour: 24,
            color: this.timeColors[0].color,
        };
        const factor = (hour - curr.hour) / (next.hour - curr.hour);

        const hex2rgb = (hex) => hex.match(/\w\w/g).map((x) => parseInt(x, 16));
        const [r1, g1, b1] = hex2rgb(curr.color);
        const [r2, g2, b2] = hex2rgb(next.color);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
    }

    isValidHexColor(hex) {
        return /^#[A-Fa-f0-9]{6}$/.test(hex);
    }

    toggle() {
        const enabled = localStorage.getItem("dynamicBackground") === "true";
        localStorage.setItem("dynamicBackground", !enabled);
    }

    init() {
        this.updateBackground();
        setInterval(() => this.updateBackground(), 60000);
        window.addEventListener("storage", () => this.updateBackground());
    }
}
