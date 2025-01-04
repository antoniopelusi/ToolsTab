import json
import re

simple_icons_path = 'simple-icons.json'
slugs_path = 'slugs.md'
output_path = '../assets/icons/icons.json'

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
        hex_code = icon.get("hex")
        slug = slugs.get(title)

        if slug:
            icons.append({
                "name": slug,
                "hex": hex_code,
                "source": f"{slug}.svg"
            })

    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(icons, file, indent=4, ensure_ascii=False)

generate_icons_json(simple_icons_path, slugs_path, output_path)