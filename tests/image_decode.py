"""Decode every image used by the manual, including the complete pixel stream."""
import json
import base64
import io
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
manual = json.loads((root / "data/manual.json").read_text(encoding="utf-8"))
count = 0
for section in ("faults", "maintenance", "safety"):
    for item in manual[section]:
        for step in item.get("steps", []):
            if not step.get("image"):
                continue
            path = root / step["image"].split("?", 1)[0]
            if path.suffix == ".svg":
                svg = ET.parse(path).getroot()
                embedded = svg.find("{http://www.w3.org/2000/svg}image")
                assert embedded is not None
                href = embedded.attrib["href"]
                assert href.startswith("data:image/jpeg;base64,")
                raw = base64.b64decode(href.split(",", 1)[1], validate=True)
                assert raw == (root / "assets/images/centering-2-valve.jpeg").read_bytes()
                source = io.BytesIO(raw)
            else:
                source = path
            with Image.open(source) as image:
                image.verify()
            if isinstance(source, io.BytesIO):
                source.seek(0)
            with Image.open(source) as image:
                image.load()
                assert image.width > 0 and image.height > 0
            count += 1
            print(f"PASS: {path.name}")
print(f"Manual images decoded: {count}")
