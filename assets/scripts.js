/**********************/
/* DYNAMIC BACKGROUND */
/**********************/
const STORAGE_KEY = "dynamicbackground";
const UPDATE_INTERVAL = 60000;

function getDynamicBackgroundState() {
	let state = localStorage.getItem(STORAGE_KEY);
	if (state === null) {
		state = "true";
		localStorage.setItem(STORAGE_KEY, state);
	}
	return state === "true";
}

function interpolateColor(color1, color2, factor) {
	const [r1, g1, b1] = hexToRgb(color1);
	const [r2, g2, b2] = hexToRgb(color2);

	const r = Math.round(r1 + (r2 - r1) * factor);
	const g = Math.round(g1 + (g2 - g1) * factor);
	const b = Math.round(b1 + (b2 - b1) * factor);

	return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return [r, g, b];
}

function rgbToHex(r, g, b) {
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getBackgroundColors() {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();

	const colors = {
		earlyMorning: "#41405d", // 03:00 - 06:00
		dawn: "#f3ae5d", // 06:00 - 09:00
		morning: "#74c3e1", // 09:00 - 12:00
		noon: "#57b0d9", // 12:00 - 15:00
		afternoon: "#6d9cc3", // 15:00 - 18:00
		evening: "#e48959", // 18:00 - 21:00
		night: "#314867", // 21:00 - 00:00
		midnight: "#1c304b", // 00:00 - 03:00
	};

	let startColor, endColor, factor;

	if (hours >= 0 && hours < 3) {
		startColor = colors.midnight;
		endColor = colors.earlyMorning;
		factor = (hours + minutes / 60) / 3;
	} else if (hours >= 3 && hours < 6) {
		startColor = colors.earlyMorning;
		endColor = colors.dawn;
		factor = (hours + minutes / 60 - 3) / 3;
	} else if (hours >= 6 && hours < 9) {
		startColor = colors.dawn;
		endColor = colors.morning;
		factor = (hours + minutes / 60 - 6) / 3;
	} else if (hours >= 9 && hours < 12) {
		startColor = colors.morning;
		endColor = colors.noon;
		factor = (hours + minutes / 60 - 9) / 3;
	} else if (hours >= 12 && hours < 15) {
		startColor = colors.noon;
		endColor = colors.afternoon;
		factor = (hours + minutes / 60 - 12) / 3;
	} else if (hours >= 15 && hours < 18) {
		startColor = colors.afternoon;
		endColor = colors.evening;
		factor = (hours + minutes / 60 - 15) / 3;
	} else if (hours >= 18 && hours < 21) {
		startColor = colors.evening;
		endColor = colors.night;
		factor = (hours + minutes / 60 - 18) / 3;
	} else {
		startColor = colors.night;
		endColor = colors.midnight;
		factor = (hours + minutes / 60 - 21) / 3;
	}

	return { startColor, endColor, factor };
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
		setInterval(updateBackgroundColor, UPDATE_INTERVAL);
		updateBackgroundColor();
	}
}

/**********************/
/*      CALENDAR      */
/**********************/
const initializeDateTimeAndCalendar = () => {
	const updateDateTime = () => {
		const currentDate = new Date();
		const dayOfWeek = currentDate.toLocaleDateString("en-EN", {
			weekday: "long",
		});
		const date = currentDate.getDate();
		const month = currentDate.toLocaleDateString("en-EN", { month: "long" });
		const year = currentDate.getFullYear();

		let hours = currentDate.getHours();
		const minutes = currentDate.getMinutes().toString().padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		hours = hours % 12;
		hours = hours ? hours : 12;

		const currentDateElement = document.getElementById("current-date");
		currentDateElement.style.overflowY = "scroll";

		currentDateElement.textContent = "";

		const dateParagraph = document.createElement("p");
		dateParagraph.textContent = `${date} ${month} ${year}`;
		const dayOfWeekParagraph = document.createElement("p");
		dayOfWeekParagraph.textContent = dayOfWeek;

		currentDateElement.appendChild(dateParagraph);
		currentDateElement.appendChild(dayOfWeekParagraph);

		const currentTimeElement = document.getElementById("current-time");
		currentTimeElement.style.overflowY = "scroll";
		currentTimeElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
	};

	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth();
	const day = document.querySelector(".calendar-dates");
	const currdate = document.querySelector(".calendar-current-date");
	const prenexIcons = document.querySelectorAll(".calendar-navigation span");

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

	const manipulateCalendar = () => {
		let dayone = new Date(year, month, 1).getDay();
		dayone = dayone === 0 ? 6 : dayone - 1;

		let lastdate = new Date(year, month + 1, 0).getDate();
		let dayend = new Date(year, month, lastdate).getDay();
		dayend = dayend === 0 ? 6 : dayend - 1;

		let monthlastdate = new Date(year, month, 0).getDate();

		let lit = "";

		for (let i = dayone; i > 0; i--) {
			lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
		}

		for (let i = 1; i <= lastdate; i++) {
			let isToday =
				i === date.getDate() &&
				month === new Date().getMonth() &&
				year === new Date().getFullYear()
					? "active"
					: "";
			lit += `<li class="${isToday}">${i}</li>`;
		}

		for (let i = dayend; i < 6; i++) {
			lit += `<li class="inactive">${i - dayend + 1}</li>`;
		}

		currdate.innerText = `${months[month]} ${year}`;
		day.innerHTML = lit;
	};

	prenexIcons.forEach((icon) => {
		icon.addEventListener("click", () => {
			month = icon.id === "calendar-prev" ? month - 1 : month + 1;

			if (month < 0 || month > 11) {
				date = new Date(year, month, new Date().getDate());
				year = date.getFullYear();
				month = date.getMonth();
			} else {
				date = new Date();
			}

			manipulateCalendar();
		});
	});

	updateDateTime();
	manipulateCalendar();
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

	const loadChecklist = () => {
		const savedChecklist =
			JSON.parse(localStorage.getItem(TODO_STORAGE_KEY)) || [];
		todolist.innerHTML = "";
		savedChecklist.forEach(({ text, checked }) =>
			addChecklistItem(text, checked),
		);
	};

	const saveChecklist = () => {
		const items = Array.from(todolist.children).map((item) => ({
			text: item.querySelector("span").textContent,
			checked: item.querySelector("input[type='checkbox']").checked,
		}));
		localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(items));
	};

	const addChecklistItem = (text, checked = false) => {
		const li = document.createElement("li");
		li.className = "checklist-item";
		if (checked) li.classList.add("completed");

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = checked;
		checkbox.addEventListener("change", () => {
			if (checkbox.checked) {
				li.classList.add("completed");
			} else {
				li.classList.remove("completed");
			}
			saveChecklist();
			updateClearButtonVisibility();
		});

		const span = document.createElement("span");
		span.textContent = text;
		span.className = "todo-text";

		const moveContainer = document.createElement("div");
		moveContainer.className = "move-buttons";

		const upBtn = document.createElement("button");
		upBtn.textContent = "▲";
		upBtn.className = "move-up";

		const downBtn = document.createElement("button");
		downBtn.textContent = "▼";
		downBtn.className = "move-down";

		upBtn.addEventListener("click", () => {
			const prev = li.previousElementSibling;
			if (prev) {
				todolist.insertBefore(li, prev);
				saveChecklist();
				updateMoveButtons();
			}
		});

		downBtn.addEventListener("click", () => {
			const next = li.nextElementSibling;
			if (next) {
				todolist.insertBefore(next, li);
				saveChecklist();
				updateMoveButtons();
			}
		});

		moveContainer.appendChild(upBtn);
		moveContainer.appendChild(downBtn);

		span.addEventListener("click", (event) => {
			if (span.querySelector("input")) return;

			if (event.altKey) {
				const originalText = span.textContent;
				const input = document.createElement("input");
				input.type = "text";
				input.value = span.textContent;
				span.textContent = "";
				input.style.backgroundColor = "transparent";
				input.style.color = "white";
				input.style.fontFamily = "Ubuntu Mono";
				input.style.fontSize = "16px";
				input.style.width = "100%";
				input.style.border = "none";
				input.style.outline = "none";
				span.appendChild(input);
				input.focus();

				input.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						if (input.value.trim() === "") {
							li.remove();
							saveChecklist();
							updateClearButtonVisibility();
						} else {
							span.textContent = input.value.trim();
							saveChecklist();
						}
					} else if (e.key === "Escape") {
						span.textContent = originalText;
					} else if (e.key === "Delete") {
						li.remove();
						saveChecklist();
						updateClearButtonVisibility();
					}
				});

				input.addEventListener("blur", () => {
					if (input.value.trim() === "") {
						li.remove();
						saveChecklist();
						updateClearButtonVisibility();
					} else {
						span.textContent = input.value.trim();
						saveChecklist();
					}
				});
			} else if (event.ctrlKey) {
				li.remove();
				saveChecklist();
				updateClearButtonVisibility();
				updateMoveButtons();
			}
		});

		li.appendChild(checkbox);
		li.appendChild(span);
		li.appendChild(moveContainer);
		todolist.appendChild(li);

		updateMoveButtons();
	};

	const updateMoveButtons = () => {
		const items = Array.from(
			document.querySelectorAll("#todolist .checklist-item"),
		);
		items.forEach((item, index) => {
			const upBtn = item.querySelector(".move-up");
			const downBtn = item.querySelector(".move-down");

			if (upBtn) {
				upBtn.disabled = index === 0;
				upBtn.style.opacity = upBtn.disabled ? "0.2" : "0.7";
				upBtn.classList.add("move-btn");
			}
			if (downBtn) {
				downBtn.disabled = index === items.length - 1;
				downBtn.style.opacity = downBtn.disabled ? "0.2" : "0.7";
				downBtn.classList.add("move-btn");
			}
		});
	};

	const updateClearButtonVisibility = () => {
		const hasChecked = Array.from(todolist.children).some(
			(item) =>
				item.classList.contains("completed") &&
				item.querySelector("input[type='checkbox']").checked,
		);

		clearCompletedButton.style.display = hasChecked ? "flex" : "none";
	};

	newTodoInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			const text = newTodoInput.value.trim();
			if (text) {
				addChecklistItem(text);
				newTodoInput.value = "";
				saveChecklist();
			}
		}
	});

	clearCompletedButton.addEventListener("click", () => {
		Array.from(todolist.children)
			.filter((item) => item.querySelector("input[type='checkbox']").checked)
			.forEach((item) => item.remove());
		saveChecklist();
		clearCompletedButton.style.display = "none";
	});

	window.addEventListener("storage", (event) => {
		if (event.key === TODO_STORAGE_KEY) {
			const checklist = JSON.parse(event.newValue);
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

const linksContainer = document.getElementById("links-container");

const initializeLinks = () => {
	const fetchSvgOrDefault = async (name) => {
		try {
			const response = await fetch(`assets/icons/icons/${name}.svg`);
			if (!response.ok) {
				throw new Error("SVG not found");
			}
			return await response.text();
		} catch {
			const defaultResponse = await fetch("assets/icons/default.svg");
			return await defaultResponse.text();
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

	const addButtonToGrid = (pair, index) => {
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
					if (titleElement) {
						titleElement.remove();
					}

					fetch("assets/icons/icons.json")
						.then((response) => response.json())
						.then((data) => {
							const match = data.find((item) => item.name === pair.text1);
							if (match) {
								svgElement.setAttribute("fill", `#${match.hex}`);
							}
						});

					svgElement.classList.add("icon");
					button.appendChild(svgElement);
					button.appendChild(textSpan);

					textSpan.addEventListener("click", (event) => {
						handleButtonClick(event, button);
					});

					svgElement.addEventListener("click", (event) => {
						handleButtonClick(event, button);
					});
				})
				.catch((error) => console.error("Error handling SVG:", error));
		}

		button.addEventListener("click", (event) => {
			handleButtonClick(event, button);
		});

		linksContainer.appendChild(button);
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
		const savedLinks =
			JSON.parse(localStorage.getItem(LINKS_STORAGE_KEY)) || [];

		savedLinks.sort((a, b) => a.text1.localeCompare(b.text1));

		const columns = 3;
		const totalLinks = savedLinks.length;
		const totalRows = Math.ceil(totalLinks / columns);

		const isLastRowComplete = totalLinks % columns === 0;

		const rowsToShow = isLastRowComplete ? totalRows + 1 : totalRows;

		linksContainer.innerHTML = "";
		for (let i = 0; i < rowsToShow * columns; i++) {
			addButtonToGrid(savedLinks[i] || { text1: "", text2: "" }, i);
		}
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
			location.reload();
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

		input1.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				saveInput(0);
			} else if (event.key === "Delete") {
				saveInput(1);
			} else if (event.key === "Escape") {
				cancelEdit();
			}
		});

		input2.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				saveInput(0);
			} else if (event.key === "Delete") {
				saveInput(1);
			} else if (event.key === "Escape") {
				cancelEdit();
			}
		});

		input1.addEventListener("blur", handleBlur);
		input2.addEventListener("blur", handleBlur);
	};

	window.addEventListener("storage", (event) => {
		if (event.key === LINKS_STORAGE_KEY) {
			const links = JSON.parse(event.newValue);
			linksContainer.innerHTML = "";
			links.forEach((pair, index) => addButtonToGrid(pair, index));
		}
	});

	initializeGrid();
};

/**********************/
/*     CLIPBOARD      */
/**********************/
const initializeClipboard = () => {
	const saveClipboardData = () => {
		const textareas = document.querySelectorAll(
			"#clipboard-container textarea",
		);
		textareas.forEach((textarea) => {
			const id = textarea.id;
			localStorage.setItem(id, textarea.value);
		});
	};

	const loadClipboardData = () => {
		const textareas = document.querySelectorAll(
			"#clipboard-container textarea",
		);
		textareas.forEach((textarea) => {
			const id = textarea.id;
			const savedData = localStorage.getItem(id);
			if (savedData) {
				textarea.value = savedData;
				updateTextareaBorder(textarea);
			}
		});
	};

	const updateTextareaBorder = (textarea) => {
		if (textarea.value === "") {
			textarea.style.borderBottom = "none";
			textarea.style.backgroundColor = "transparent";
		} else {
			textarea.style.borderBottom = "rgba(0, 0, 0, 0.1) 5px solid";
			textarea.style.backgroundColor = "rgba(0, 0, 0, 0.07)";
		}
	};

	const textareas = document.querySelectorAll("#clipboard-container textarea");
	textareas.forEach((textarea) => {
		textarea.addEventListener("input", () => {
			saveClipboardData();
			updateTextareaBorder(textarea);
		});

		textarea.addEventListener("click", (event) => {
			if (event.altKey) {
				navigator.clipboard.writeText(textarea.value);
			} else if (event.ctrlKey) {
				textarea.value = "";
				textarea.style.borderBottom = "none";
				textarea.style.backgroundColor = "transparent";
				saveClipboardData();
			}
		});

		textarea.addEventListener("input", () => {
			updateTextareaBorder(textarea);
		});
	});

	window.addEventListener("load", loadClipboardData);

	window.addEventListener("storage", (event) => {
		if (event.key && event.key.startsWith("clipboard-")) {
			const textarea = document.getElementById(event.key);
			if (textarea) {
				textarea.value = event.newValue;
				updateTextareaBorder(textarea);
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

function updateLinesHeight() {
	const scrollHeight = notepad.scrollHeight;
	notepadLines.style.height = scrollHeight + "px";
}

const initializeNotepad = () => {
	const loadContent = (element, storageKey) => {
		const savedContent = localStorage.getItem(storageKey);
		if (savedContent) element.value = savedContent;
		notepad.addEventListener("input", updateLinesHeight);
		notepad.addEventListener("scroll", () => {
			notepadLines.style.transform = `translateY(-${notepad.scrollTop}px)`;
		});
		updateLinesHeight();
	};

	const saveContent = (element, storageKey) => {
		element.addEventListener("input", () => {
			localStorage.setItem(storageKey, element.value);
		});
	};

	const syncNotepadWithStorage = () => {
		window.addEventListener("storage", (event) => {
			if (event.key === NOTEPAD_STORAGE_KEY) {
				notepad.value = event.newValue;
			}
		});
	};

	loadContent(notepad, NOTEPAD_STORAGE_KEY);
	saveContent(notepad, NOTEPAD_STORAGE_KEY);
	syncNotepadWithStorage();
};

/**********************/
/*       BACKUP       */
/**********************/
function downloadLocalStorage() {
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
}

function uploadLocalStorage() {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "application/json";
	input.style.display = "none";

	input.onchange = function (event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function (event) {
			try {
				const data = JSON.parse(event.target.result);
				if (typeof data === "object" && data !== null) {
					for (const [key, value] of Object.entries(data)) {
						localStorage.setItem(key, value);
					}
					location.reload();
					console.log("LocalStorage caricato con successo!");
				} else {
					console.log("Il file non è valido!");
				}
			} catch (error) {
				console.log("Errore durante il caricamento del file!");
			}
		};
		reader.readAsText(file);
	};

	document.body.appendChild(input);
	input.click();
	document.body.removeChild(input);
}

function initializeBackup() {
	document
		.getElementById("calendar-card")
		.addEventListener("click", function (event) {
			if (event.altKey) {
				uploadLocalStorage();
			} else if (event.ctrlKey) {
				downloadLocalStorage();
			}
		});
}

/**********************/
/*        INIT        */
/**********************/

function initializeLocalStorage() {
	const initialValues = {
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

	for (const [key, value] of Object.entries(initialValues)) {
		if (localStorage.getItem(key) === null) {
			localStorage.setItem(key, value);
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	initializeLocalStorage();
	initializeDynamicBackground();
	initializeDateTimeAndCalendar();
	initializeTodoList();
	initializeLinks();
	initializeClipboard();
	initializeNotepad();
	initializeBackup();
});
