# 502 手册状态（2026-10-30）

- 手册版本：0.3.1；缓存：welding-guide-502-v15。
- 保留 2 项异常处理手顺，没有更改操作文字。
- 2# 对中第 3 步改用完整的 `centering-2-valve.jpeg?v=0.3.1`。该原图已有数显和按钮圈选说明，未修改原图内容。
- 原引用 `centering-2-valve-annotated.png` 文件被截断：IDAT 声明 2,120,648 字节，实际剩余约 764,506 字节，Pillow 完整解码失败。保留该历史文件，但不再引用。
- 修复前 `tests/image_decode.py` 报 Truncated File Read；修复后手册引用的 3 张图片全部通过 verify/load。
- `node tests/validate.mjs` 通过；本地 Edge 已打开对中手顺大图，上下标注和完整设备照片可见。
- 图片完整性测试需要 Python Pillow：`python tests/image_decode.py`。
- 发布状态应以 GitHub Pages 的最新部署记录和线上 manual.json 为准。
