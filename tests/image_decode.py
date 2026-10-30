"""Decode every image used by the manual, including the complete pixel stream."""
import json
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
            with Image.open(path) as image:
                image.verify()
            with Image.open(path) as image:
                image.load()
                assert image.width > 0 and image.height > 0
            count += 1
            print(f"PASS: {path.name}")
print(f"Manual images decoded: {count}")
