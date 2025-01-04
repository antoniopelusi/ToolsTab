browser.windows.onCreated.addListener((window) => {
	if (window.type === "normal") {
		let executionCount = 0;
		const maxExecutions = 50;

		const executeWithDelay = () => {
			if (executionCount < maxExecutions) {
				setTimeout(() => {
					browser.tabs.query({ windowId: window.id }).then((tabs) => {
						let stopLoop = false;

						tabs.forEach((tab) => {
							if (
								tab.url === "about:newtab" ||
								tab.url === "about:blank" ||
								tab.url === "about:home"
							) {
								browser.tabs.update(tab.id, { url: "index.html" });
								stopLoop = true;
							}
						});

						if (!stopLoop) {
							executionCount++;
							executeWithDelay();
						}
					});
				}, 100);
			}
		};

		executeWithDelay();
	}
});
