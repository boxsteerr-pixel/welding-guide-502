"""Add editable SVG annotations around the unmodified original photograph."""
import base64
from pathlib import Path

root = Path(__file__).resolve().parents[1]
raw = (root / "assets/images/centering-2-valve.jpeg").read_bytes()
encoded = base64.b64encode(raw).decode("ascii")
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1920" viewBox="0 0 2560 1920" role="img" aria-label="入口阀台数显及手动按钮位置">
<image width="2560" height="1920" href="data:image/jpeg;base64,{encoded}"/>
<defs><marker id="arrow" viewBox="0 0 20 20" refX="17" refY="10" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1 L19 10 L1 19 Z" fill="#ed2727" stroke="white" stroke-width="2"/></marker></defs>
<!-- Targets follow the circles already present on the source photograph. -->
<ellipse cx="784" cy="344" rx="129" ry="139" fill="none" stroke="white" stroke-width="14"/>
<ellipse cx="784" cy="344" rx="129" ry="139" fill="none" stroke="#ed2727" stroke-width="8"/>
<ellipse cx="1087" cy="1526" rx="137" ry="108" fill="none" stroke="white" stroke-width="14"/>
<ellipse cx="1087" cy="1526" rx="137" ry="108" fill="none" stroke="#ed2727" stroke-width="8"/>
<path d="M993 176 L923 224 L889 267" fill="none" stroke="white" stroke-width="20" stroke-linecap="round"/>
<path d="M993 176 L923 224 L889 267" fill="none" stroke="#ed2727" stroke-width="11" stroke-linecap="round" marker-end="url(#arrow)"/>
<path d="M1310 1560 L1250 1560 L1226 1544" fill="none" stroke="white" stroke-width="20" stroke-linecap="round"/>
<path d="M1310 1560 L1250 1560 L1226 1544" fill="none" stroke="#ed2727" stroke-width="11" stroke-linecap="round" marker-end="url(#arrow)"/>
<rect x="988" y="6" width="505" height="292" rx="20" fill="#fff" stroke="#ed2727" stroke-width="7"/>
<rect x="988" y="6" width="505" height="85" rx="16" fill="#ed2727"/>
<text x="1010" y="67" fill="#fff" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="56" font-weight="700">① 数显确认</text>
<text x="1010" y="164" fill="#1b283a" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="58" font-weight="700">按住按钮后</text>
<text x="1010" y="242" fill="#d72020" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="58" font-weight="700">数值大于 150</text>
<rect x="1304" y="1482" width="440" height="190" rx="20" fill="#fff" stroke="#ed2727" stroke-width="7"/>
<rect x="1304" y="1482" width="440" height="83" rx="16" fill="#ed2727"/>
<text x="1325" y="1542" fill="#fff" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="54" font-weight="700">② 阀按钮</text>
<text x="1325" y="1644" fill="#1b283a" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="58" font-weight="700">按住此处</text>
</svg>'''
(root / "assets/images/centering-2-valve-guide.svg").write_text(svg, encoding="utf-8")
