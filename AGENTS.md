# 502 焊机手册开发与发布约定

## 接续入口
- 每次先读 `docs/PROJECT_STATUS.md`，再检查 `git status -sb`、分支、日志、远程和真实部署。聊天记录不能替代仓库状态。
- 仓库：`boxsteerr-pixel/welding-guide-502`，默认 `main`；GitHub Pages：<https://boxsteerr-pixel.github.io/welding-guide-502/>。
- 本地目录外还存在其他设备仓库，不得混用内容或图片。干净工作区同步优先使用 `git fetch origin` 和 `git merge --ff-only origin/main`；保留用户未提交工作。

## 结构与规范
- `data/manual.json`：设备版本、手顺、步骤及图片路径的单一内容入口；新增前按 id、标题及步骤检查是否已存在。
- `js/app.js`：页面渲染、搜索、大图与安装；`css/`：样式；`index.html`：页面骨架。
- `service-worker.js`：仅管理本设备缓存，HTML/JS/CSS/JSON 网络优先，图片缓存优先；首次浏览过的图片可离线使用。不要宣称未访问图片已离线缓存。
- 更新脚本或样式时同步 HTML 查询版本及 CORE_ASSETS；每次发布变更缓存版本。图片使用新的版本文件名，避免缓存旧图。
- 手顺属于现场设备操作知识，不擅自改阈值、按钮、公式、操作顺序或补写未获依据的设备动作。现场审核与网站技术验收分开记录。
- 新功能用 textContent/createTextNode 插入文案，保持键盘操作与移动端可用。

## 图片保护
- 原图绝不覆盖、裁切、擦字、重绘、替换设备细节。现有图上的旧标注也保留。
- 压缩、编码转换和标注仅生成独立派生文件；页面保留原图入口，记录来源、尺寸与大小。截图优先无损 WebP，照片可适度缩小编码但必须核对可读性。
- 新标注采用代码原生 SVG/HTML，文字放图片外侧，箭头指向经过原图确认的目标。不要用生成式修图改变设备内容。
- 已知 `centering-2-valve-annotated.png` 截断，必须保留作追溯但禁止引用。完整来源是 `centering-2-valve.jpeg`。
- `scripts/build-images.cjs` 生成当前派生资源，依赖 sharp（可通过 SHARP_MODULE 指定模块路径）；不要把某台机器的绝对依赖路径写死到脚本。

## 发布验收
1. 核对线上数据与本地远程提交；检查全部手顺逐项数量、步骤、图片和来源。空的维护/安全栏目如实记录。
2. `node tests/validate.mjs`；`node --check js/app.js`；`node --check service-worker.js`。
3. 安装或配置 playwright，运行 `node tests/browser-check.cjs`（可用 PLAYWRIGHT_MODULE 指定模块路径）。覆盖 390px 手机和 1440px 桌面：3 张图真实解码、无 404/JS 错误/横向溢出、大图关闭保留位置、已浏览内容离线刷新。
4. 查看 `tests/qa-390.png`、`tests/qa-1440.png`，人工核对文字框/箭头与设备目标。浏览器仿真不能称为真机验收。
5. `git diff` 检查原图无变化。只提交本任务文件；提交前更新 PROJECT_STATUS，推送后确认 Pages workflow 的 head_sha 与代码提交一致且 conclusion=success。
6. 在线重新执行浏览器验收：CHECK_URL 设为 Pages 地址；逐项下载线上 HTML/JS/CSS/JSON/图片与本地字节对比。保存验收结果。
7. 每次任务结束前更新 `docs/PROJECT_STATUS.md`，记录实际提交、部署证据、完成项、遗留问题和下一步。尚未验证的发布必须明确标为待验证。
