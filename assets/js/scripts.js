const Storage = {
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    load: (key, fallback = null) => {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    },
};

class DateTime {
    months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    updateDateTime() {
        const now = new Date();
        const day = now.getDate();
        const month = this.months[now.getMonth()];
        const year = now.getFullYear();
        const dayName = this.days[now.getDay()];

        const use24h = localStorage.getItem("use24h") === "true";

        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");

        let timeString;
        if (use24h) {
            timeString = `${hours.toString().padStart(2, "0")}:${minutes}`;
        } else {
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            timeString = `${hours}:${minutes} ${ampm}`;
        }

        const dateEl = document.getElementById("date-display");
        const dayEl = document.getElementById("day-display");
        const timeEl = document.getElementById("time-display");

        if (dateEl) dateEl.textContent = `${day} ${month} ${year}`;
        if (dayEl) dayEl.textContent = dayName;
        if (timeEl) timeEl.textContent = timeString;
    }

    init() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }
}

class TodoList {
    constructor() {
        this.todos = Storage.load("todolist", []);
        this.list = document.getElementById("todo-list");
        this.input = document.getElementById("todo-input");
        this.clearBtn = document.getElementById("clear-completed");
        this.editing = null;
    }

    save() {
        Storage.save("todolist", this.todos);
    }

    addTodo(text) {
        if (!text.trim()) return;
        this.todos.push({
            id: Date.now(),
            text: text.trim(),
            completed: false,
        });
        this.save();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter((t) => t.id !== id);
        this.save();
        this.render();
    }

    editTodo(id, newText) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.save();
            this.render();
        }
    }

    startEdit(li, todo) {
        if (this.editing) return;
        this.editing = todo.id;

        const span = li.querySelector("span");
        const input = document.createElement("input");
        input.type = "text";
        input.value = todo.text;

        li.replaceChild(input, span);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        const save = () => {
            this.editTodo(todo.id, input.value);
            this.editing = null;
        };

        const cancel = () => {
            this.editing = null;
            this.render();
        };

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                save();
            } else if (e.key === "Escape") {
                e.preventDefault();
                cancel();
            } else if (e.key === "Delete") {
                e.preventDefault();
                this.deleteTodo(todo.id);
                this.editing = null;
            }
        });
        input.addEventListener("blur", save);
    }

    moveTodo(id, direction) {
        const index = this.todos.findIndex((t) => t.id === id);
        if (index === -1) return;

        if (direction === "up" && index > 0) {
            [this.todos[index - 1], this.todos[index]] = [
                this.todos[index],
                this.todos[index - 1],
            ];
        } else if (direction === "down" && index < this.todos.length - 1) {
            [this.todos[index], this.todos[index + 1]] = [
                this.todos[index + 1],
                this.todos[index],
            ];
        } else {
            return;
        }

        this.save();
        this.render();
    }

    render() {
        this.list.innerHTML = "";

        const hasCompleted = this.todos.some((t) => t.completed);
        this.clearBtn.style.display = hasCompleted ? "" : "none";

        this.todos.forEach((todo, idx) => {
            const li = document.createElement("li");
            li.className = todo.completed ? "completed" : "";
            li.style.display = "flex";
            li.style.alignItems = "flex-start";

            const span = document.createElement("span");
            span.textContent = todo.text;
            span.style.marginRight = "auto";
            span.style.wordWrap = "break-word";
            span.style.overflowWrap = "break-word";
            span.style.flex = "1";
            span.style.minWidth = "0";
            li.appendChild(span);

            const arrows = document.createElement("div");
            arrows.style.display = "flex";
            arrows.style.flexDirection = "column";
            arrows.style.justifyContent = "center";
            arrows.style.gap = "0px";
            arrows.style.height = "auto";
            arrows.style.marginLeft = "calc(var(--spacing) * 0.3)";

            const createArrow = (symbol, disabled) => {
                const btn = document.createElement("button");
                btn.textContent = symbol;
                btn.style.background = "none";
                btn.style.border = "none";
                btn.style.padding = "0";
                btn.style.margin = "0";
                btn.style.flex = "0";
                btn.style.height = "auto";
                btn.style.lineHeight = "1";
                btn.style.cursor = disabled ? "default" : "pointer";
                btn.style.opacity = disabled ? "0.3" : "1";
                btn.style.color = "#ffffff70";
                btn.style.fontSize = "clamp(14px, 1.7vh, 20px)";
                return btn;
            };

            const upArrow = createArrow("▲", idx === 0);
            const downArrow = createArrow("▼", idx === this.todos.length - 1);

            upArrow.addEventListener("click", (e) => {
                e.stopPropagation();
                if (idx !== 0) this.moveTodo(todo.id, "up");
            });
            downArrow.addEventListener("click", (e) => {
                e.stopPropagation();
                if (idx !== this.todos.length - 1)
                    this.moveTodo(todo.id, "down");
            });

            arrows.appendChild(upArrow);
            arrows.appendChild(downArrow);
            li.appendChild(arrows);

            li.addEventListener("click", (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.deleteTodo(todo.id);
                } else if (e.altKey) {
                    e.preventDefault();
                    this.startEdit(li, todo);
                } else {
                    const rect = li.getBoundingClientRect();
                    const bulletWidth =
                        parseFloat(getComputedStyle(li, "::before").width) ||
                        20;
                    if (e.clientX - rect.left <= bulletWidth + 10) {
                        this.toggleTodo(todo.id);
                    }
                }
            });

            this.list.appendChild(li);
        });
    }

    init() {
        this.render();
        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.addTodo(this.input.value);
                this.input.value = "";
            }
        });
        this.clearBtn.addEventListener("click", () => {
            this.todos = this.todos.filter((t) => !t.completed);
            this.save();
            this.render();
        });

        window.addEventListener("storage", (e) => {
            if (e.key === "todolist") {
                this.todos = JSON.parse(e.newValue || "[]");
                this.render();
            }
        });
    }
}

class Clipboard {
    constructor() {
        this.slots = Storage.load("clipboard", ["", "", "", "", ""]);
    }

    save() {
        Storage.save("clipboard", this.slots);
    }

    copyToClipboard(text) {
        if (!text) return;
        navigator.clipboard.writeText(text).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
        });
    }

    init() {
        for (let i = 0; i < 5; i++) {
            const slot = document.getElementById(`clip-slot-${i + 1}`);
            if (!slot) continue;

            slot.value = this.slots[i];

            if (this.slots[i].trim()) {
                slot.classList.add("has-content");
            }

            slot.addEventListener("click", (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.slots[i] = "";
                    slot.value = "";
                    slot.classList.remove("has-content");
                    this.save();
                } else if (e.altKey) {
                    e.preventDefault();
                    this.copyToClipboard(this.slots[i]);
                }
            });

            slot.addEventListener("input", () => {
                this.slots[i] = slot.value;
                this.save();

                if (slot.value.trim()) {
                    slot.classList.add("has-content");
                } else {
                    slot.classList.remove("has-content");
                }
            });
        }

        window.addEventListener("storage", (e) => {
            if (e.key === "clipboard") {
                this.slots = JSON.parse(e.newValue || '["", "", "", "", ""]');
                for (let i = 0; i < 5; i++) {
                    const slot = document.getElementById(`clip-slot-${i + 1}`);
                    if (!slot) continue;
                    slot.value = this.slots[i];
                    slot.classList.toggle(
                        "has-content",
                        this.slots[i].trim() !== "",
                    );
                }
            }
        });
    }
}

class Bookmarks {
    constructor() {
        this.bookmarks = Storage.load("bookmarks", []);
        this.grid = document.getElementById("bookmarks-grid");
        this.editingButton = null;
        this.iconsMap = {};
        this.iconsLoaded = false;
        this.loadIcons();
    }

    loadIcons() {
        fetch("./assets/icons/icons.json")
            .then((response) => response.json())
            .then((data) => {
                this.iconsMap = {};
                data.forEach((icon) => {
                    this.iconsMap[icon.title.toLowerCase()] = icon;
                    this.iconsMap[icon.slug.toLowerCase()] = icon;
                });
                this.iconsLoaded = true;
                this.render();
            });
    }

    getBookmarkIcon(nameOrSlug) {
        if (!this.iconsLoaded || !this.iconsMap || !nameOrSlug) return null;
        const key = nameOrSlug.toLowerCase().trim();
        return this.iconsMap[key] || null;
    }

    createEmptyButton() {
        const button = document.createElement("div");
        button.innerHTML = "";
        button.style.padding = "0";
        button.style.margin = "0";
        button.style.boxSizing = "border-box";

        button.addEventListener("click", (e) => {
            if (e.altKey) {
                e.preventDefault();
                this.startEdit(button);
            }
        });

        return button;
    }

    createFilledButton(bookmark, index) {
        const button = document.createElement("a");
        button.href = bookmark.url;
        button.dataset.bookmarkIndex = index;

        const iconData =
            this.getBookmarkIcon(bookmark.name) ||
            this.getBookmarkIcon(bookmark.slug);
        const iconSrc = iconData
            ? `./assets/icons/simpleicons/${iconData.source}`
            : "./assets/icons/default.svg";
        const iconColor = iconData ? `#${iconData.hex}` : "var(--color-300)";

        button.innerHTML = "";

        const iconContainer = document.createElement("div");
        iconContainer.style.display = "flex";
        iconContainer.style.flexDirection = "column";
        iconContainer.style.alignItems = "center";
        iconContainer.style.justifyContent = "center";
        iconContainer.style.width = "100%";

        fetch(iconSrc)
            .then((response) => response.text())
            .then((svgText) => {
                const div = document.createElement("div");
                div.innerHTML = svgText;
                const svg = div.querySelector("svg");
                if (svg) {
                    svg.setAttribute("fill", iconColor);
                    svg.style.display = "block";
                    svg.style.margin = "0 auto";
                    iconContainer.appendChild(svg);
                } else {
                    const fallbackImg = document.createElement("img");
                    fallbackImg.src = "./assets/icons/default.svg";
                    fallbackImg.alt = "icon";
                    fallbackImg.style.display = "block";
                    fallbackImg.style.margin = "0 auto";
                    fallbackImg.style.width =
                        "calc(var(--font-size-small) * 2)";
                    fallbackImg.style.height =
                        "calc(var(--font-size-small) * 2)";
                    iconContainer.appendChild(fallbackImg);
                }
                const span = document.createElement("span");
                span.textContent = bookmark.name;
                span.style.display = "block";
                span.style.textAlign = "center";
                span.style.marginTop = "4px";
                iconContainer.appendChild(span);
            });

        button.appendChild(iconContainer);

        button.addEventListener("click", (e) => {
            if (e.altKey) {
                e.preventDefault();
                this.startEdit(button, bookmark);
            } else if (e.ctrlKey || e.metaKey || e.button === 1) {
                e.preventDefault();
                window.open(bookmark.url, "_blank");
            }
        });

        button.addEventListener("auxclick", (e) => {
            if (e.button === 1) {
                e.preventDefault();
                window.open(bookmark.url, "_blank");
            }
        });

        return button;
    }

    startEdit(button, bookmark = null) {
        if (this.editingButton) return;
        this.editingButton = button;

        const newButton = button.cloneNode(false);
        if (newButton.href) {
            newButton.removeAttribute("href");
        }
        button.parentNode.replaceChild(newButton, button);
        this.editingButton = newButton;

        newButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        const editDiv = document.createElement("div");
        editDiv.style.display = "flex";
        editDiv.style.flexDirection = "column";
        editDiv.style.alignItems = "center";
        editDiv.style.justifyContent = "center";
        editDiv.style.width = "100%";
        editDiv.style.height = "100%";
        editDiv.style.boxSizing = "border-box";
        editDiv.style.padding = "0";
        editDiv.style.gap = "6px";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Name";
        nameInput.value = bookmark ? bookmark.name : "";
        nameInput.autocomplete = "off";
        nameInput.spellcheck = false;
        nameInput.style.width = "100%";
        nameInput.style.boxSizing = "border-box";

        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.placeholder = "URL";
        urlInput.value = bookmark ? bookmark.url : "";
        urlInput.autocomplete = "off";
        urlInput.spellcheck = false;
        urlInput.style.width = "100%";
        urlInput.style.boxSizing = "border-box";

        editDiv.appendChild(nameInput);
        editDiv.appendChild(urlInput);

        newButton.innerHTML = "";
        newButton.appendChild(editDiv);

        nameInput.focus();

        const saveEdit = () => {
            const name = nameInput.value.trim();
            const url = urlInput.value.trim();

            if (name && url) {
                if (bookmark) {
                    bookmark.name = name;
                    bookmark.url = url;
                } else {
                    this.bookmarks.push({ name, url });
                }
                this.bookmarks.sort((a, b) => a.name.localeCompare(b.name));
                this.save();
                this.render();
            } else {
                this.cancelEdit();
            }
        };

        const cancelEdit = () => {
            if (!this.editingButton) return;
            const btn = this.editingButton;

            if (btn && btn.dataset.bookmarkIndex !== undefined && bookmark) {
                const index = parseInt(btn.dataset.bookmarkIndex, 10);
                const restored = this.createFilledButton(bookmark, index);
                btn.parentNode.replaceChild(restored, btn);
            } else {
                const restored = this.createEmptyButton();
                btn.parentNode.replaceChild(restored, btn);
            }
            this.editingButton = null;
        };

        const deleteBookmark = () => {
            if (bookmark) {
                this.bookmarks = this.bookmarks.filter((b) => b !== bookmark);
                this.save();
                this.render();
            } else {
                cancelEdit();
            }
        };

        const handleKeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                saveEdit();
            } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
            } else if (e.key === "Delete") {
                e.preventDefault();
                deleteBookmark();
            }
        };

        nameInput.addEventListener("keydown", handleKeydown);
        urlInput.addEventListener("keydown", handleKeydown);

        nameInput.addEventListener("click", (e) => e.stopPropagation());
        urlInput.addEventListener("click", (e) => e.stopPropagation());
        nameInput.addEventListener("mousedown", (e) => e.stopPropagation());
        urlInput.addEventListener("mousedown", (e) => e.stopPropagation());

        let blurTimeout;
        const handleBlur = () => {
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(() => {
                if (!editDiv.contains(document.activeElement)) {
                    saveEdit();
                }
            }, 100);
        };

        nameInput.addEventListener("blur", handleBlur);
        urlInput.addEventListener("blur", handleBlur);
    }

    cancelEdit() {
        if (!this.editingButton) return;
        const btn = this.editingButton;
        const parent = btn.parentNode;

        if (btn.dataset.bookmarkIndex !== undefined) {
            const index = parseInt(btn.dataset.bookmarkIndex, 10);
            const bookmark = this.bookmarks[index];
            const restored = this.createFilledButton(bookmark, index);
            parent.replaceChild(restored, btn);
        } else {
            const restored = this.createEmptyButton();
            parent.replaceChild(restored, btn);
        }

        this.editingButton = null;
    }

    save() {
        Storage.save("bookmarks", this.bookmarks);
    }

    render() {
        this.grid.innerHTML = "";
        this.editingButton = null;

        const sortedBookmarks = [...this.bookmarks].sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        sortedBookmarks.forEach((bookmark, index) => {
            this.grid.appendChild(this.createFilledButton(bookmark, index));
        });

        this.grid.appendChild(this.createEmptyButton());
    }

    init() {
        if (!this.grid) return;
        if (this.iconsLoaded) {
            this.render();
        }

        window.addEventListener("storage", (e) => {
            if (e.key === "bookmarks") {
                this.bookmarks = JSON.parse(e.newValue || "[]");
                this.render();
            }
        });
    }
}

class Notepad {
    constructor() {
        this.content = JSON.parse(localStorage.getItem("notepad") || '""');
        this.textarea = document.getElementById("notepad");
    }

    save() {
        if (this.textarea) {
            this.content = this.textarea.value;
            localStorage.setItem("notepad", JSON.stringify(this.content));
        }
    }

    init() {
        if (!this.textarea) return;

        this.textarea.value = this.content;

        this.textarea.addEventListener("input", () => this.save());

        window.addEventListener("storage", (e) => {
            if (e.key === "notepad") {
                this.content = JSON.parse(e.newValue || '""');
                if (this.textarea.value !== this.content) {
                    this.textarea.value = this.content;
                }
            }
        });
    }
}

function initializeStorage() {
    if (!localStorage.getItem("dynamicBackground")) {
        Storage.save("dynamicBackground", true);
    }

    if (!localStorage.getItem("customBackgroundColor")) {
        Storage.save("customBackgroundColor", "");
    }

    if (!localStorage.getItem("todolist")) {
        Storage.save("todolist", []);
    }

    if (!localStorage.getItem("bookmarks")) {
        Storage.save("bookmarks", []);
    }

    if (!localStorage.getItem("clipboard")) {
        Storage.save("clipboard", ["", "", "", "", ""]);
    }

    if (!localStorage.getItem("notepad")) {
        Storage.save("notepad", "");
    }
}

class ImportExport {
    static exportConfig() {
        const config = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            config[key] = localStorage.getItem(key);
        }

        const dataStr = JSON.stringify(config, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "toolstab.config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static importConfig() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.style.display = "none";

        input.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();

                reader.onload = (event) => {
                    try {
                        const config = JSON.parse(event.target.result);

                        localStorage.clear();

                        for (const [key, value] of Object.entries(config)) {
                            localStorage.setItem(key, value);
                        }

                        location.reload();
                    } catch (error) {
                        alert(
                            "Error importing configuration: Invalid JSON file",
                        );
                        console.error("Import error:", error);
                    }
                };

                reader.readAsText(file);
            }
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    static init() {
        const firstSection = document.querySelector("section:nth-child(1)");
        if (firstSection) {
            firstSection.addEventListener("click", (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    ImportExport.exportConfig();
                } else if (e.altKey) {
                    e.preventDefault();
                    ImportExport.importConfig();
                }
            });

            firstSection.addEventListener("mouseenter", (e) => {
                firstSection.style.cursor = "pointer";
            });

            firstSection.addEventListener("mouseleave", (e) => {
                firstSection.style.cursor = "default";
            });
        }
    }
}

function main() {
    initializeStorage();
    new DynamicBackground().init();

    new DateTime().init();
    new TodoList().init();
    new Bookmarks().init();
    new Clipboard().init();
    new Notepad().init();
    ImportExport.init();

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) {
                document.activeElement.blur();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    main();
});
