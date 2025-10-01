import os
import shutil
import subprocess
import json
import re

TARGET_DIR = "assets/icons/simpleicons"
TMP_DIR = "utils/simpleicons_tmp"
REPO_URL = "https://github.com/simple-icons/simple-icons.git"
OUTPUT_JSON = "assets/icons/icons.json"

def parse_slugs(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    slugs = {}
    for line in lines:
        match = re.match(r'\|\s*`(.+?)`\s*\|\s*`(.+?)`\s*\|', line)
        if match:
            brand_name, brand_slug = match.groups()
            slugs[brand_name] = brand_slug
    return slugs

def generate_icons_json(simple_icons_path, slugs_path, output_path):
    with open(simple_icons_path, 'r', encoding='utf-8') as file:
        simple_icons = json.load(file)

    slugs = parse_slugs(slugs_path)

    icons = []
    for icon in simple_icons:
        title = icon.get("title")
        hex = icon.get("hex")
        slug = slugs.get(title)

        if slug:
            icons.append({
                "title": title,
                "slug": slug,
                "hex": hex,
                "source": f"{slug}.svg"
            })

    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(icons, file, indent=4, ensure_ascii=False)


if os.path.exists(TARGET_DIR):
    print(f"Removing existing directory: {TARGET_DIR}")
    shutil.rmtree(TARGET_DIR)


if os.path.exists(TMP_DIR):
    print(f"Removing existing directory: {TMP_DIR}")
    shutil.rmtree(TMP_DIR)


print(f"Cloning Simple Icons repo into {TMP_DIR} ...")
subprocess.run(["git", "clone", "--depth", "1", REPO_URL, TMP_DIR], check=True)


simple_icons_json = os.path.join(TMP_DIR, "data", "simple-icons.json")
slug_md = os.path.join(TMP_DIR, "slugs.md")
icons_dir = os.path.join(TMP_DIR, "icons")

if not os.path.exists(simple_icons_json):
    raise RuntimeError("simple-icons.json not found!")
if not os.path.exists(slug_md):
    raise RuntimeError("slug.md not found!")
if not os.path.exists(icons_dir):
    raise RuntimeError("icons directory not found!")


print(f"Copying icons to {TARGET_DIR} ...")
shutil.copytree(icons_dir, TARGET_DIR)


print(f"Generating {OUTPUT_JSON} ...")
generate_icons_json(simple_icons_json, slug_md, OUTPUT_JSON)

print("Done!")
print(f"Simple Icons JSON: {simple_icons_json}")
print(f"Slug MD: {slug_md}")
print(f"Icons copied to: {TARGET_DIR}")
print(f"Icons JSON generated at: {OUTPUT_JSON}")
