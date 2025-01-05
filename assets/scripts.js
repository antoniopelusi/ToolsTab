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
		night: "#001f3d",
		dawn: "#ff6f47",
		morning: "#87ceeb",
		noon: "#00bfff",
		sunset: "#f27a3a",
		evening: "#3d4f5c",
	};

	let startColor, endColor, factor;

	if (hours >= 0 && hours < 6) {
		startColor = colors.night;
		endColor = colors.dawn;
		factor = (hours + minutes / 60) / 6;
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
		endColor = colors.sunset;
		factor = (hours + minutes / 60 - 12) / 3;
	} else if (hours >= 15 && hours < 18) {
		startColor = colors.sunset;
		endColor = colors.evening;
		factor = (hours + minutes / 60 - 15) / 3;
	} else {
		startColor = colors.evening;
		endColor = colors.night;
		factor = (hours + minutes / 60 - 18) / 6;
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

		currentDateElement.textContent = "";

		const dateParagraph = document.createElement("p");
		dateParagraph.textContent = `${date} ${month} ${year}`;
		const dayOfWeekParagraph = document.createElement("p");
		dayOfWeekParagraph.textContent = dayOfWeek;

		currentDateElement.appendChild(dateParagraph);
		currentDateElement.appendChild(dayOfWeekParagraph);

		const currentTimeElement = document.getElementById("current-time");
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

		li.appendChild(checkbox);
		li.appendChild(span);
		todolist.appendChild(li);
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
const MAX_LINKS = 15;

const linksContainer = document.getElementById("links-container");

const initializeLinks = () => {
	const loadBookmarksFromFile = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.addEventListener("change", (event) => {
			const file = event.target.files[0];

			if (file) {
				const reader = new FileReader();

				reader.onload = (e) => {
					try {
						const data = JSON.parse(e.target.result);
						localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(data));
					} catch (error) {
						console.error(error);
					}
				};

				reader.onerror = (e) => {
					console.error(e);
				};

				reader.readAsText(file);
				location.reload();
			}
		});

		input.click();
	};

	const saveBookmarksToFile = () => {
		const bookmarks = localStorage.getItem(LINKS_STORAGE_KEY);
		const blob = new Blob([bookmarks], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "bookmarks.json";
		link.click();
	};

	const fetchSvgOrDefault = async (name) => {
		try {
			const response = await fetch(`assets/icons/icons/${name}.svg`);
			if (!response.ok) {
				throw new Error("SVG not found");
			}
			return await response.text();
		} catch {
			const defaultResponse = await fetch("assets/icons/icons/default.svg");
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

		for (let i = 0; i < MAX_LINKS; i++) {
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
			let newText1 = "";
			let newText2 = "";
			if (status === 0) {
				newText1 = input1.value.trim().toLowerCase();
				newText2 = input2.value.trim();
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

	document
		.getElementById("title-button")
		.addEventListener("click", function (event) {
			if (event.altKey) {
				loadBookmarksFromFile();
			} else if (event.ctrlKey) {
				saveBookmarksToFile();
			}
		});
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

const initializeNotepad = () => {
	const loadContent = (element, storageKey) => {
		const savedContent = localStorage.getItem(storageKey);
		if (savedContent) element.value = savedContent;
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

document.addEventListener("DOMContentLoaded", () => {
	initializeDynamicBackground();
	initializeDateTimeAndCalendar();
	initializeTodoList();
	initializeLinks();
	initializeClipboard();
	initializeNotepad();
});
