document.addEventListener("DOMContentLoaded", () => {
	const checkbox = document.getElementById("dynamicBackgroundCheckbox");

	const loadBackgroundState = () => {
		let dynamicBackgroundState = localStorage.getItem("dynamicbackground");

		checkbox.checked = dynamicBackgroundState === "true";
	};

	checkbox.addEventListener("change", () => {
		localStorage.setItem("dynamicbackground", checkbox.checked);
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.reload(tabs[0].id);
		});
	});

	loadBackgroundState();
});
