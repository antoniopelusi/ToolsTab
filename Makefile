VERSION := "1.7"
OUT_DIR := out

.PHONY: firefox chrome clean

.SILENT: firefox chrome clean

all: firefox chrome

firefox:
	cp firefox_manifest.json manifest.json
	@mkdir -p $(OUT_DIR)
	zip -rq "$(OUT_DIR)/ToolsTab-$(VERSION)-firefox.zip" \
		assets \
		extension-popup \
		index.html \
		LICENSE \
		README.md \
		manifest.json
	echo "{}" > manifest.json
	echo "|> Firefox extension packed"

chrome:
	cp chrome_manifest.json manifest.json
	zip -rq "$(OUT_DIR)/ToolsTab-$(VERSION)-chrome.zip" \
		assets \
		extension-popup \
		index.html \
		LICENSE \
		README.md \
		manifest.json
	echo "{}" > manifest.json
	echo "|> Chrome extension packed"

clean:
	rm -rf $(OUT_DIR)
	echo "|> .zip deleted"