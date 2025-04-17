/**********************/
/* DYNAMIC BACKGROUND */
/**********************/
const STORAGE_KEY = "dynamicbackground";
const UPDATE_INTERVAL = 60000;

function getDynamicBackgroundState() {
	const state = localStorage.getItem(STORAGE_KEY);
	if (state === null) {
		localStorage.setItem(STORAGE_KEY, "true");
		return true;
	}
	return state === "true";
}

function hexToRgb(hex) {
	return [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16),
	];
}

function rgbToHex(r, g, b) {
	return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function interpolateColor(color1, color2, factor) {
	const rgb1 = hexToRgb(color1);
	const rgb2 = hexToRgb(color2);
	const interpolated = rgb1.map((c, i) =>
		Math.round(c + (rgb2[i] - c) * factor),
	);
	return rgbToHex(...interpolated);
}

function getBackgroundColors() {
	const colors = [
		{ hour: 0, color: "#1c304b" }, // midnight
		{ hour: 3, color: "#41405d" }, // earlyMorning
		{ hour: 6, color: "#f3ae5d" }, // dawn
		{ hour: 9, color: "#74c3e1" }, // morning
		{ hour: 12, color: "#57b0d9" }, // noon
		{ hour: 15, color: "#6d9cc3" }, // afternoon
		{ hour: 18, color: "#e48959" }, // evening
		{ hour: 21, color: "#314867" }, // night
		{ hour: 24, color: "#1c304b" }, // back to midnight
	];

	const now = new Date();
	const currentHour = now.getHours() + now.getMinutes() / 60;

	let i = 0;
	while (i < colors.length - 1 && currentHour >= colors[i + 1].hour) {
		i++;
	}

	const start = colors[i];
	const end = colors[i + 1];
	const factor = (currentHour - start.hour) / (end.hour - start.hour || 1);

	return { startColor: start.color, endColor: end.color, factor };
}

function updateBackgroundColor() {
	const { startColor, endColor, factor } = getBackgroundColors();
	document.body.style.backgroundColor = interpolateColor(
		startColor,
		endColor,
		factor,
	);
}

function initializeDynamicBackground() {
	if (getDynamicBackgroundState()) {
		updateBackgroundColor();
		setInterval(updateBackgroundColor, UPDATE_INTERVAL);
	}
}

/**********************/
/*      CALENDAR      */
/**********************/
const initializeDateTimeAndCalendar = () => {
	const currentDateElement = document.getElementById("current-date");
	const currentTimeElement = document.getElementById("current-time");
	const dayContainer = document.querySelector(".calendar-dates");
	const currDateLabel = document.querySelector(".calendar-current-date");
	const navIcons = document.querySelectorAll(".calendar-navigation span");

	const months = [
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

	let today = new Date();
	let currentYear = today.getFullYear();
	let currentMonth = today.getMonth();

	const updateDateTime = () => {
		const now = new Date();
		const dayOfWeek = now.toLocaleDateString("en-EN", { weekday: "long" });
		const date = now.getDate();
		const month = now.toLocaleDateString("en-EN", { month: "long" });
		const year = now.getFullYear();

		let hours = now.getHours();
		const minutes = now.getMinutes().toString().padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		hours = hours % 12 || 12;

		currentDateElement.textContent = "";
		currentDateElement.appendChild(createParagraph(`${date} ${month} ${year}`));
		currentDateElement.appendChild(createParagraph(dayOfWeek));

		currentTimeElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
	};

	const createParagraph = (text) => {
		const p = document.createElement("p");
		p.textContent = text;
		return p;
	};

	const generateCalendar = () => {
		const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
		const firstDayOffset = (firstDayIndex + 6) % 7;
		const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
		const prevLastDate = new Date(currentYear, currentMonth, 0).getDate();
		const endDayIndex = new Date(currentYear, currentMonth, lastDate).getDay();
		const endOffset = (endDayIndex + 6) % 7;

		let daysMarkup = "";

		for (let i = firstDayOffset; i > 0; i--) {
			daysMarkup += `<li class="inactive">${prevLastDate - i + 1}</li>`;
		}

		for (let i = 1; i <= lastDate; i++) {
			const isToday =
				i === today.getDate() &&
				currentMonth === today.getMonth() &&
				currentYear === today.getFullYear()
					? "active"
					: "";
			daysMarkup += `<li class="${isToday}">${i}</li>`;
		}

		for (let i = endOffset; i < 6; i++) {
			daysMarkup += `<li class="inactive">${i - endOffset + 1}</li>`;
		}

		currDateLabel.innerText = `${months[currentMonth]} ${currentYear}`;
		dayContainer.innerHTML = daysMarkup;
	};

	navIcons.forEach((icon) => {
		icon.addEventListener("click", () => {
			currentMonth += icon.id === "calendar-prev" ? -1 : 1;

			if (currentMonth < 0 || currentMonth > 11) {
				const newDate = new Date(currentYear, currentMonth);
				currentYear = newDate.getFullYear();
				currentMonth = newDate.getMonth();
			}

			generateCalendar();
		});
	});

	updateDateTime();
	generateCalendar();
	setInterval(updateDateTime, 1000);
};

/**********************/
/*      TODOLIST      */
/**********************/
const TODO_STORAGE_KEY = "todolist-content";

const initializeTodoList = () => {
	const todolist = document.getElementById("todolist");
	const newTodoInput = document.getElementById("new-todo");
	const clearCompletedButton = document.getElementById("clear-completed");

	const saveChecklist = () => {
		const items = [...todolist.children].map((item) => ({
			text: item.querySelector(".todo-text").textContent,
			checked: item.querySelector("input[type='checkbox']").checked,
		}));
		localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(items));
	};

	const updateClearButtonVisibility = () => {
		const hasChecked = [...todolist.children].some(
			(item) =>
				item.classList.contains("completed") &&
				item.querySelector("input[type='checkbox']").checked,
		);
		clearCompletedButton.style.display = hasChecked ? "flex" : "none";
	};

	const updateMoveButtons = () => {
		const items = [...todolist.querySelectorAll(".checklist-item")];
		items.forEach((item, index) => {
			const [upBtn, downBtn] = item.querySelectorAll(".move-buttons button");
			upBtn.disabled = index === 0;
			downBtn.disabled = index === items.length - 1;
			[upBtn, downBtn].forEach((btn) => {
				btn.classList.add("move-btn");
				btn.style.opacity = btn.disabled ? "0.2" : "0.7";
			});
		});
	};

	const createEditableSpan = (text, li) => {
		const span = document.createElement("span");
		span.textContent = text;
		span.className = "todo-text";

		span.addEventListener("click", (event) => {
			if (span.querySelector("input")) return;

			if (event.altKey) {
				const originalText = span.textContent;
				const input = document.createElement("input");
				Object.assign(input.style, {
					backgroundColor: "transparent",
					color: "white",
					fontFamily: "Ubuntu Mono",
					fontSize: "16px",
					width: "100%",
					border: "none",
					outline: "none",
				});
				input.type = "text";
				input.value = originalText;

				span.textContent = "";
				span.appendChild(input);
				input.focus();

				const finalizeEdit = (cancel = false) => {
					const newText = input.value.trim();
					if (!cancel && newText) {
						span.textContent = newText;
					} else if (!cancel) {
						li.remove();
					} else {
						span.textContent = originalText;
					}
					saveChecklist();
					updateClearButtonVisibility();
				};

				input.addEventListener("keydown", (e) => {
					if (e.key === "Enter") finalizeEdit();
					else if (e.key === "Escape") finalizeEdit(true);
					else if (e.key === "Delete") {
						li.remove();
						saveChecklist();
						updateClearButtonVisibility();
					}
				});
				input.addEventListener("blur", () => finalizeEdit());
			} else if (event.ctrlKey) {
				li.remove();
				saveChecklist();
				updateClearButtonVisibility();
				updateMoveButtons();
			}
		});

		return span;
	};

	const addChecklistItem = (text, checked = false) => {
		const li = document.createElement("li");
		li.className = "checklist-item";
		if (checked) li.classList.add("completed");

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = checked;
		checkbox.addEventListener("change", () => {
			li.classList.toggle("completed", checkbox.checked);
			saveChecklist();
			updateClearButtonVisibility();
		});

		const span = createEditableSpan(text, li);

		const moveContainer = document.createElement("div");
		moveContainer.className = "move-buttons";

		const upBtn = document.createElement("button");
		upBtn.textContent = "▲";
		upBtn.className = "move-up";
		upBtn.addEventListener("click", () => {
			const prev = li.previousElementSibling;
			if (prev) {
				todolist.insertBefore(li, prev);
				saveChecklist();
				updateMoveButtons();
			}
		});

		const downBtn = document.createElement("button");
		downBtn.textContent = "▼";
		downBtn.className = "move-down";
		downBtn.addEventListener("click", () => {
			const next = li.nextElementSibling;
			if (next) {
				todolist.insertBefore(next, li);
				saveChecklist();
				updateMoveButtons();
			}
		});

		moveContainer.append(upBtn, downBtn);
		li.append(checkbox, span, moveContainer);
		todolist.appendChild(li);
		updateMoveButtons();
	};

	const loadChecklist = () => {
		const savedChecklist =
			JSON.parse(localStorage.getItem(TODO_STORAGE_KEY)) || [];
		todolist.innerHTML = "";
		savedChecklist.forEach(({ text, checked }) =>
			addChecklistItem(text, checked),
		);
	};

	newTodoInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			const text = newTodoInput.value.trim();
			if (text) {
				addChecklistItem(text);
				newTodoInput.value = "";
				saveChecklist();
			}
		}
	});

	clearCompletedButton.addEventListener("click", () => {
		[...todolist.children]
			.filter((item) => item.querySelector("input[type='checkbox']").checked)
			.forEach((item) => item.remove());
		saveChecklist();
		updateClearButtonVisibility();
	});

	window.addEventListener("storage", (event) => {
		if (event.key === TODO_STORAGE_KEY) {
			const checklist = JSON.parse(event.newValue) || [];
			todolist.innerHTML = "";
			checklist.forEach(({ text, checked }) => addChecklistItem(text, checked));
			updateClearButtonVisibility();
		}
	});

	loadChecklist();
	updateClearButtonVisibility();
};

/**********************/
/*     BOOKMARKS      */
/**********************/
const LINKS_STORAGE_KEY = "links-content";
const MAX_LINKS = 30;

let iconsData = [];
const svgCache = new Map();

const linksContainer = document.getElementById("links-container");

const loadIconsData = async () => {
	if (iconsData.length === 0) {
		const response = await fetch("assets/icons/icons.json");
		iconsData = await response.json();
	}
};

const fetchSvgOrDefault = async (name) => {
	await loadIconsData();

	const match = iconsData.find(
		(item) =>
			item.slug.toLowerCase() === name.toLowerCase() ||
			item.title.toLowerCase() === name.toLowerCase(),
	);
	const slugToUse = match ? match.slug : name;

	if (svgCache.has(slugToUse)) {
		return svgCache.get(slugToUse);
	}

	try {
		const svgResponse = await fetch(`assets/icons/icons/${slugToUse}.svg`);
		if (!svgResponse.ok) throw new Error("SVG not found");

		const svgText = await svgResponse.text();
		svgCache.set(slugToUse, svgText);
		return svgText;
	} catch {
		const defaultText = await fetch("assets/icons/default.svg").then((res) =>
			res.text(),
		);
		svgCache.set(slugToUse, defaultText);
		return defaultText;
	}
};

const handleButtonClick = (event, button) => {
	event.stopPropagation();
	const link = button.dataset.text2;

	if (event.altKey) {
		event.preventDefault();
		editButton(button);
	} else if (link) {
		if (event.ctrlKey) {
			event.preventDefault();
			window.open(link, "_blank");
		} else {
			window.location.href = link;
		}
	}
};

const addButtonToGrid = (pair, index, fragment = null) => {
	const button = document.createElement("button");
	button.className = "link-button";
	button.dataset.text2 = pair.text2 || "";
	button.dataset.index = index;

	if (pair.text1) {
		const textSpan = document.createElement("span");
		textSpan.textContent = pair.text1;
		textSpan.className = "button-text";

		fetchSvgOrDefault(pair.text1)
			.then((svgContent) => {
				const parser = new DOMParser();
				const svgElement = parser.parseFromString(
					svgContent,
					"image/svg+xml",
				).documentElement;

				const titleElement = svgElement.querySelector("title");
				if (titleElement) titleElement.remove();

				const match = iconsData.find(
					(item) =>
						item.slug.toLowerCase() === pair.text1.toLowerCase() ||
						item.title.toLowerCase() === pair.text1.toLowerCase(),
				);
				if (match) svgElement.setAttribute("fill", `#${match.hex}`);

				svgElement.classList.add("icon");

				button.appendChild(svgElement);
				button.appendChild(textSpan);

				[textSpan, svgElement].forEach((el) =>
					el.addEventListener("click", (e) => handleButtonClick(e, button)),
				);
			})
			.catch((error) => console.error("Error handling SVG:", error));
	}

	button.addEventListener("click", (event) => {
		handleButtonClick(event, button);
	});

	(fragment || linksContainer).appendChild(button);
};

const saveLinks = () => {
	const buttons = Array.from(linksContainer.querySelectorAll(".link-button"));
	const links = buttons
		.map((btn) => {
			const text1 = btn.textContent.trim();
			const text2 = btn.dataset.text2 || "";

			if (text1 && text2) {
				return { text1, text2 };
			}
			return null;
		})
		.filter((link) => link !== null);

	links.sort((a, b) => a.text1.localeCompare(b.text1));

	if (links.length > 0) {
		localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
	} else {
		localStorage.removeItem(LINKS_STORAGE_KEY);
	}
};

const initializeGrid = () => {
	const savedLinks = JSON.parse(localStorage.getItem(LINKS_STORAGE_KEY)) || [];
	savedLinks.sort((a, b) => a.text1.localeCompare(b.text1));

	const columns = 3;
	const totalLinks = savedLinks.length;
	const totalRows = Math.ceil(totalLinks / columns);
	const isLastRowComplete = totalLinks % columns === 0;
	const rowsToShow = isLastRowComplete ? totalRows + 1 : totalRows;

	linksContainer.innerHTML = "";
	const fragment = document.createDocumentFragment();

	for (let i = 0; i < rowsToShow * columns; i++) {
		addButtonToGrid(savedLinks[i] || { text1: "", text2: "" }, i, fragment);
	}

	linksContainer.appendChild(fragment);
};

const editButton = (button) => {
	const currentText = button.textContent;
	const currentText1 = currentText.trim();
	const currentText2 = button.dataset.text2 || "";

	const container = document.createElement("div");
	container.className = "link-edit-container";

	const input1 = document.createElement("input");
	input1.type = "text";
	input1.value = currentText1 || "";
	input1.className = "button-edit-input";
	input1.placeholder = "name";

	const input2 = document.createElement("input");
	input2.type = "text";
	input2.value = currentText2 || "";
	input2.className = "button-edit-input";
	input2.placeholder = "link";

	container.appendChild(input1);
	container.appendChild(input2);
	button.replaceWith(container);
	input1.focus();

	const saveInput = (status) => {
		const newText1 = status === 0 ? input1.value.trim().toLowerCase() : "";
		const newText2 = status === 0 ? input2.value.trim() : "";

		if (newText1 === currentText1 && newText2 === currentText2) {
			container.replaceWith(button);
			return;
		}

		if (
			currentText1 === "" &&
			currentText2 === "" &&
			(input1.value.trim().toLowerCase() === "" || input2.value.trim() === "")
		) {
			container.replaceWith(button);
			return;
		}

		if (newText1 === "" || newText2 === "") {
			button.textContent = "";
			button.dataset.text2 = "";
		} else {
			button.textContent = newText1;
			button.dataset.text2 = newText2;
		}

		container.replaceWith(button);
		saveLinks();
		initializeGrid();
	};

	const cancelEdit = () => {
		container.replaceWith(button);
	};

	const handleBlur = () => {
		setTimeout(() => {
			if (!container.contains(document.activeElement)) {
				saveInput(0);
			}
		}, 0);
	};

	[input1, input2].forEach((input) => {
		input.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				saveInput(0);
			} else if (event.key === "Delete") {
				saveInput(1);
			} else if (event.key === "Escape") {
				cancelEdit();
			}
		});
		input.addEventListener("blur", handleBlur);
	});
};

window.addEventListener("storage", (event) => {
	if (event.key === LINKS_STORAGE_KEY) {
		const links = JSON.parse(event.newValue);
		linksContainer.innerHTML = "";
		const fragment = document.createDocumentFragment();
		links.forEach((pair, index) => addButtonToGrid(pair, index, fragment));
		linksContainer.appendChild(fragment);
	}
});

/**********************/
/*     CLIPBOARD      */
/**********************/
const initializeClipboard = () => {
	const container = document.querySelectorAll("#clipboard-container textarea");

	const saveClipboardData = () => {
		container.forEach((textarea) =>
			localStorage.setItem(textarea.id, textarea.value),
		);
	};

	const loadClipboardData = () => {
		container.forEach((textarea) => {
			const saved = localStorage.getItem(textarea.id);
			if (saved !== null) {
				textarea.value = saved;
				updateTextareaStyle(textarea);
			}
		});
	};

	const updateTextareaStyle = (textarea) => {
		const hasContent = textarea.value.trim() !== "";
		textarea.style.borderBottom = hasContent
			? "rgba(0, 0, 0, 0.1) 5px solid"
			: "none";
		textarea.style.backgroundColor = hasContent
			? "rgba(0, 0, 0, 0.07)"
			: "transparent";
	};

	container.forEach((textarea) => {
		textarea.addEventListener("input", () => {
			saveClipboardData();
			updateTextareaStyle(textarea);
		});

		textarea.addEventListener("click", (event) => {
			if (event.altKey) {
				navigator.clipboard.writeText(textarea.value);
			} else if (event.ctrlKey) {
				textarea.value = "";
				updateTextareaStyle(textarea);
				saveClipboardData();
			}
		});
	});

	window.addEventListener("load", loadClipboardData);

	window.addEventListener("storage", (event) => {
		if (event.key?.startsWith("clipboard-")) {
			const textarea = document.getElementById(event.key);
			if (textarea) {
				textarea.value = event.newValue || "";
				updateTextareaStyle(textarea);
			}
		}
	});
};

/**********************/
/*       NOTEPAD      */
/**********************/
const NOTEPAD_STORAGE_KEY = "notepad-content";

const notepad = document.getElementById("notepad");
const notepadLines = document.getElementById("notepad-lines");

const updateLinesHeight = () => {
	notepadLines.style.height = `${notepad.scrollHeight}px`;
};

const initializeNotepad = () => {
	const loadContent = () => {
		const saved = localStorage.getItem(NOTEPAD_STORAGE_KEY);
		if (saved) notepad.value = saved;
		updateLinesHeight();
	};

	const saveContent = () => {
		localStorage.setItem(NOTEPAD_STORAGE_KEY, notepad.value);
	};

	notepad.addEventListener("input", () => {
		saveContent();
		updateLinesHeight();
	});

	notepad.addEventListener("scroll", () => {
		notepadLines.style.transform = `translateY(-${notepad.scrollTop}px)`;
	});

	window.addEventListener("resize", updateLinesHeight);

	window.addEventListener("storage", (event) => {
		if (event.key === NOTEPAD_STORAGE_KEY) {
			notepad.value = event.newValue || "";
			updateLinesHeight();
		}
	});

	loadContent();
};

/**********************/
/*       BACKUP       */
/**********************/
const downloadLocalStorage = () => {
	const data = JSON.stringify(localStorage);
	const blob = new Blob([data], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "toolstab.config.json";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

const uploadLocalStorage = () => {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "application/json";
	input.style.display = "none";

	input.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target.result);
				if (typeof data === "object" && data !== null) {
					Object.entries(data).forEach(([key, value]) =>
						localStorage.setItem(key, value),
					);
					location.reload();
					console.log("LocalStorage caricato con successo!");
				} else {
					console.warn("Il file non è valido.");
				}
			} catch (err) {
				console.error("Errore durante il caricamento del file.");
			}
		};
		reader.readAsText(file);
	});

	document.body.appendChild(input);
	input.click();
	document.body.removeChild(input);
};

const initializeBackup = () => {
	document
		.getElementById("calendar-card")
		.addEventListener("click", (event) => {
			if (event.altKey) {
				uploadLocalStorage();
			} else if (event.ctrlKey) {
				downloadLocalStorage();
			}
		});
};

/**********************/
/*        INIT        */
/**********************/
function initializeLocalStorage() {
	const defaults = {
		dynamicbackground: "true",
		"clipboard-1": "",
		"clipboard-2": "",
		"clipboard-3": "",
		"clipboard-4": "",
		"clipboard-5": "",
		"notepad-content": "",
		"links-content": "[]",
		"todolist-content": "[]",
	};

	Object.entries(defaults).forEach(([key, value]) => {
		if (!localStorage.hasOwnProperty(key)) {
			localStorage.setItem(key, value);
		}
	});
}

document.addEventListener("DOMContentLoaded", () => {
	initializeLocalStorage();
	initializeDynamicBackground();
	initializeDateTimeAndCalendar();
	initializeTodoList();
	initializeGrid();
	initializeClipboard();
	initializeNotepad();
	initializeBackup();
});
