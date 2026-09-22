# Changhao Qin · Academic Personal Homepage

这是 Changhao Qin 的个人学术主页，包含研究主页和摄影随记两个入口。项目使用语义化 HTML、静态 CSS 和原生 JavaScript，可直接部署到 GitHub Pages。

## 页面结构

- `index.html`：研究主页，包含个人简介、当前研究方向、精选项目和教育经历。
- `photography.html`：摄影随记，包含响应式画廊、懒加载和图片 Lightbox。
- `404.html`：GitHub Pages 的未找到页面。
- `picture/`：头像、主页预览图和摄影资源。

## 本地预览

在仓库根目录启动任意静态服务器，例如：

```bash
python3 -m http.server 8765
```

然后访问 <http://127.0.0.1:8765/>。

## 更新内容

- 个人身份、研究方向和教育经历：编辑 `index.html`。
- 精选项目：编辑 `index.html` 中的 `#projects` 区域，并为每个项目保留真实的状态和链接。
- 个人头像：主页使用相对路径 `picture/mainphoto.jpg`；如需替换图片，请同步更新 HTML 的 `alt` 文本。
- 摄影顺序和分批加载：编辑 `photography.js` 中的 `curatedImageOrder`。
- CV：准备好真实 PDF 后，再在主页导航和 Hero 链接中加入文件路径；未准备好时不要保留空链接。

## 发布检查

发布前至少检查：

1. 主页和摄影页在桌面端、390px 移动端均无横向滚动。
2. 主页所有外链和摄影页所有图片均能加载。
3. 摄影画廊可用键盘打开，Lightbox 可用 `Esc` 关闭，并能恢复焦点。
4. `sitemap.xml` 中的 `lastmod` 与实际发布日期一致。
5. GitHub Pages 发布后重新检查线上页面，而不是只检查本地预览。

## 部署

仓库使用 GitHub Pages 的根目录部署。提交并推送到 `main` 后，在仓库的 Pages 设置中确认来源为 `main` 分支的 `/ (root)` 目录。
