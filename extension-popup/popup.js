document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("dynamicBackgroundCheckbox");
    const customColorInput = document.getElementById("customColorInput");
    const colorPreview = document.getElementById("colorPreview");
    const exportBtn = document.getElementById("exportBtn");
    const importBtn = document.getElementById("importBtn");
    const importFile = document.getElementById("importFile");

    const isValidHexColor = (hex) => /^#[A-Fa-f0-9]{6}$/.test(hex);

    const updateInputState = () => {
        customColorInput.toggleAttribute("disabled", checkbox.checked);
    };

    const loadState = () => {
        const dynamicBackgroundState =
            localStorage.getItem("dynamicBackground") ?? "true";
        localStorage.setItem("dynamicBackground", dynamicBackgroundState);

        let customColor = localStorage.getItem("customBackgroundColor");
        if (!isValidHexColor(customColor)) {
            customColor = "#313039";
            localStorage.setItem("customBackgroundColor", customColor);
        }

        checkbox.checked = dynamicBackgroundState === "true";
        customColorInput.value = customColor;
        colorPreview.style.backgroundColor = customColor;
        updateInputState();
    };

    checkbox.addEventListener("change", () => {
        localStorage.setItem(
            "dynamicBackground",
            checkbox.checked ? "true" : "false",
        );
        updateInputState();
    });

    customColorInput.addEventListener("input", () => {
        const color = customColorInput.value.trim();
        if (color === "" || isValidHexColor(color)) {
            customColorInput.style.borderColor = "var(--button-hover)";
            localStorage.setItem("customBackgroundColor", color);
            colorPreview.style.backgroundColor = isValidHexColor(color)
                ? color
                : "transparent";
        } else {
            customColorInput.style.borderColor = "#e74c3c";
        }
    });

    const timeFormatCheckbox = document.getElementById("timeFormatCheckbox");
    timeFormatCheckbox.checked = localStorage.getItem("use24h") === "true";
    timeFormatCheckbox.addEventListener("change", () => {
        localStorage.setItem(
            "use24h",
            timeFormatCheckbox.checked ? "true" : "false",
        );
    });

    exportBtn?.addEventListener("click", exportConfig);
    importBtn?.addEventListener("click", () => importFile.click());
    importFile?.addEventListener("change", (e) => {
        if (e.target.files.length) importConfig(e.target.files[0]);
    });

    loadState();
});
