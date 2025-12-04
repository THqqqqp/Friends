# Alumni Postcards Admin

Vue 3 + Vite + TailwindCSS 管理后台，负责模板与往届合照的可视化配置。该项目与前台 H5 共用同一套 Express + MySQL API，通过 JWT 登录后管理数据。

## 快速开始

```bash
# 安装依赖（在仓库根目录）
pnpm install

# 启动后台管理端
pnpm --filter admin dev

# 构建 / 预览
pnpm --filter admin build
pnpm --filter admin preview
```

## 目录结构

```
admin/
├── src/
│   ├── layouts/AdminLayout.vue        # 左侧菜单 + 顶部导航骨架
│   ├── pages/                         # Login/Templates/Gallery/Stats
│   ├── components/
│   │   ├── UploadImage.vue            # 图片上传 + 预览
│   │   ├── CanvasSelector.vue         # 底图框选区域
│   │   └── PreviewModal.vue           # 合照大图预览
│   ├── services/                      # Axios 实例 + API 封装
│   ├── stores/auth.ts                 # Pinia JWT 登录态
│   ├── router/index.ts                # 路由 + 守卫
│   └── types/api.ts                   # 模板 / 合照 / 统计类型
├── tailwind.config.js                 # Tailwind + forms 插件
├── vite.config.ts                     # Alias @ + 5174 端口
└── .env.example                       # API / uploads 基础地址
```

## 技术栈与配置

- **Vite + Vue 3 + TypeScript**：`pnpm create vite` 模板，统一使用 `<script setup>`。
- **TailwindCSS + @tailwindcss/forms**：`src/style.css` 导入 `@tailwind base/components/utilities`，并在配置中扩展 `primary` 色盘与 `Inter` 字体。
- **Pinia**：`stores/auth.ts` 负责 JWT 登录、Token 缓存与退出；在 `main.ts` 中注册后调用 `attachAuthStore`。
- **Vue Router**：`router/index.ts` 定义 `/login` + AdminLayout 嵌套路由，使用 `beforeEach` 校验 `requiresAuth` 元信息并重定向。
- **Axios 封装**：`services/http.ts` 暴露 `apiClient`、`apiBaseUrl`，注入 Pinia Store 后自动附带 `Authorization` 头并在 401 时登出。
- **ECharts**：`pages/Stats.vue` 初始化折线 / 柱状图，响应窗口自适应。

## 环境变量

复制 `.env.example` 为 `.env` 并根据部署修改：

```ini
VITE_API_BASE_URL=http://localhost:4000/api   # Express API 网关（含 /api 前缀）
VITE_UPLOAD_BASE_URL=http://localhost:4000/uploads
```

登录账号与密码来自后端 `.env` (`ADMIN_ACCOUNT` / `ADMIN_PASSWORD_HASH`)，保持一致即可。

## 核心页面概览

- **Login**：简单邮箱 + 密码表单，调用 `/auth/login`，成功后跳转 Templates。
- **Templates**：列表 + 详情双栏，支持：
  - 背景 / LOGO 上传（`UploadImage`）
  - 标语、画布尺寸与 `CanvasSelector` 框选（实时写入数据库的 `photoArea`）
  - 预览区展示 LOGO / 标语叠加效果
  - 新建 / 更新 / 删除模板
- **Gallery**：上传学院+年份合照、过滤、批量删除、下载与复制链接，点击可弹出 `PreviewModal`。
- **Stats**：调用 `/stats/chart`，用折线图展示 30 天生成/下载趋势，柱状图展示学院下载排行。

## API 约定

所有请求均基于 `VITE_API_BASE_URL`：

- `POST /auth/login`：获取 JWT。
- `GET /templates` + `GET /templates/:id`：模板列表与详情。
- `POST /templates` / `PUT /templates/:id` / `DELETE /templates/:id`：模板增删改（Multer 字段 `background`、`logo`）。
- `GET /gallery` / `POST /gallery` / `DELETE /gallery/:id` / `GET /gallery/download/:id`：往届合照管理。
- `GET /stats/chart`：统计图表数据源。

默认通过 `apiClient` 发送 JSON 或 `FormData`，无额外封装即可直接复用。
