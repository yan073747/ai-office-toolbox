# AI 办公效率工具箱

一个基于 Next.js、TypeScript 和 Tailwind CSS 的中文 AI 办公工具站。前端使用本地工具页面，后端通过 Next.js API Route 代理调用 Dify Workflow API，不在浏览器端暴露 Dify API Key。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000` 查看页面。

## 环境变量

在 `.env.local` 中配置：

```bash
DIFY_BASE_URL=https://api.dify.ai/v1

REPORT_API_KEY=
REPORT_WORKFLOW_ID=

ECOMMERCE_API_KEY=
ECOMMERCE_WORKFLOW_ID=

EXCEL_API_KEY=
EXCEL_WORKFLOW_ID=

PDF_API_KEY=
PDF_WORKFLOW_ID=

PPT_API_KEY=
PPT_WORKFLOW_ID=
```

`.env.local` 已在 `.gitignore` 中忽略，不要提交真实 API Key。

## Vercel Preview 数据库说明

Prisma 只读取 `DATABASE_URL`，不会自动读取 `DATABASE_URL_PREVIEW`。

如果需要让 Vercel Preview 部署连接 Neon Preview 分支，请在 Vercel 的 Preview 环境变量中配置名为 `DATABASE_URL` 的变量，并将它指向 Preview Neon 数据库连接串。`DATABASE_URL_PREVIEW` 可以保留作人工区分或备份，但不会被 Prisma 自动使用。

## 页面与接口

- `/tools/excel` 调用 `/api/excel`
- `/tools/pdf` 调用 `/api/pdf`
- `/tools/report` 调用 `/api/report`
- `/tools/ppt` 调用 `/api/ppt`
- `/tools/ecommerce` 调用 `/api/ecommerce`

Dify 通用调用逻辑位于 `lib/dify.ts`，包含 `uploadFile`、`runWorkflow` 和 `extractDifyResult`。
