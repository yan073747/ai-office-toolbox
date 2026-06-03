# AI办公工具箱项目档案（PROJECT_STATUS_V1.0）

生成日期：2026-06-03  
项目路径：`D:\AI工具箱`  
档案性质：开发到上线前的项目状态档案，不是产品营销介绍。  
依据来源：当前项目代码、Prisma schema、API route、组件文件、已有验收文档、当前 `npm.cmd run build` 输出。

---

## 第一部分：项目概览

### 1.1 基本信息

| 项目项 | 当前状态 |
| --- | --- |
| 项目名称 | AI办公工具箱 |
| package name | `ai-office-toolbox` |
| package version | `0.1.0` |
| 文档版本 | `PROJECT_STATUS_V1.0` |
| 当前开发阶段 | V1.0 MVP 可演示、可获客；V1.1 后端收费架构准备中 |
| 当前主入口 | `/`、`/tools`、`/tools/[toolId]`、`/dashboard` |
| 旧版兼容入口 | `/toolbox/office` |
| 内部研发入口 | `/ab-tests/excel` |

### 1.2 项目定位

AI办公工具箱是一个基于 Next.js 的中文 AI 办公效率工具站。当前正式体验以 7 个 AI 办公工具为核心，前端通过统一工具页收集文本或文件，后端通过 Next.js API Route 代理调用 Dify Workflow API，不在浏览器端暴露 Dify API Key。

当前项目同时存在两条链路：

| 链路 | 状态 | 说明 |
| --- | --- | --- |
| V1.0 演示链路 | 已接入前端 | localStorage 用户系统、localStorage 额度系统、前端工具调用前检查、成功后扣本地额度 |
| V1.1 生产化后端链路 | 已有骨架和局部真实 API | Prisma + SQLite + Auth API + Quota API + Usage API；但尚未切换前端和工具调用 |

### 1.3 项目目标

1. 提供可演示、可获客的 AI 办公工具集合。
2. 让 7 个正式工具在统一入口中可用。
3. 为后续收费版准备用户、额度、数据库和支付骨架。
4. 保留 Excel A/B 测试系统作为内部研发工具，用于后续工作流升级验证。
5. 建立行业方案页面，但在真实行业工作流上线前使用 TSX 占位，避免用户误以为已可直接体验。

### 1.4 技术栈

| 技术 | 当前使用方式 |
| --- | --- |
| Next.js | `16.2.6`，App Router，API Routes |
| React | `18.3.1` |
| TypeScript | `5.6.3`，严格模式 |
| Tailwind CSS | `3.4.15`，页面和组件样式 |
| lucide-react | 图标库 |
| react-markdown / remark-gfm / rehype-highlight | 工具输出 Markdown 渲染 |
| Dify | 后端 API Route 调用 Dify Workflow API |
| Prisma | `5.22.0` |
| SQLite | 本地开发数据库，连接值存放在 `.env`，该文件已被 Git 忽略；实际本地数据库文件在 `prisma/dev.db` |
| bcryptjs | 后端 Auth API 密码哈希 |
| Auth API | `/api/auth/register`、`/api/auth/login`、`/api/auth/logout`、`/api/auth/me` |
| Quota API | `/api/quota/me` 已读取数据库额度 |
| Usage API | `/api/usage-records` GET 已读取数据库记录；POST 仍为占位 |

### 1.5 项目架构图

```text
用户浏览器
  |
  |-- 官网页面
  |     |-- /
  |     |-- /about
  |     |-- /solutions
  |     |-- /pricing
  |     |-- /contact
  |
  |-- V1.0 前端演示用户系统
  |     |-- /login
  |     |-- /register
  |     |-- /dashboard
  |     |-- lib/user-store.ts
  |     |-- localStorage
  |
  |-- 正式工具入口
  |     |-- /tools
  |     |-- /tools/[toolId]
  |     |-- components/GenericToolPageClient.tsx
  |     |-- 调用前：canUseTool()
  |     |-- 调用后：consumeQuotaAfterSuccess()
  |
  |-- 旧版兼容工具箱
  |     |-- /toolbox/office
  |     |-- components/OfficeToolboxClient.tsx
  |
  |-- Next.js API Routes
        |
        |-- /api/toolbox/office  -> 统一 7 工具 Dify Workflow
        |-- /api/excel           -> 旧/单工具 Excel API
        |-- /api/pdf             -> 旧/单工具 PDF API
        |-- /api/report          -> 旧/单工具报告 API
        |-- /api/ppt             -> 旧/单工具 PPT API
        |-- /api/ecommerce       -> 电商文案 API
        |-- /api/ab-tests/excel  -> 内部 Excel A/B 测试
        |-- /api/auth/*          -> V1.1 后端 Auth API
        |-- /api/quota/me        -> V1.1 后端 Quota API
        |-- /api/usage-records   -> V1.1 Usage API
        |-- /api/payment/*       -> 支付占位 API
              |
              |-- lib/dify.ts
              |-- Dify Workflow API
              |
              |-- lib/prisma.ts
              |-- prisma/dev.db
```

### 1.6 当前构建状态

执行命令：

```bash
npm.cmd run build
```

结果：通过。构建输出中确认 42 个静态页面生成成功，包含：

- `/solutions`
- `/solutions/ecommerce`
- `/solutions/trade`
- `/solutions/office`
- `/solutions/content`
- `/tools`
- `/tools/[toolId]`
- Auth、Quota、Usage、Payment、Dify 相关 API route

---

## 第二部分：开发时间线

> 本时间线按当前项目代码和已有验收文档能还原出的开发顺序整理。具体日期只在已有文档中出现时记录。

### 阶段 1：Dify 工作流开发

| 项目 | 内容 |
| --- | --- |
| 完成内容 | 构建 Excel、PDF、报告、PPT、电商等 Dify Workflow 调用能力；后续统一到 `/api/toolbox/office` |
| 遇到的问题 | Workflow 输出为空、tool_type 分支不命中、文件变量名不一致、PPT blocking 超时 |
| 最终解决方案 | `lib/dify.ts` 封装上传、Workflow 调用、Streaming 调用、结果提取；`/api/toolbox/office` 统一构造 inputs；PPT 使用 `runWorkflowStreaming` 聚合最终结果 |

### 阶段 2：Codex 前端开发

| 项目 | 内容 |
| --- | --- |
| 完成内容 | 搭建 Next.js + React + Tailwind 前端页面和组件 |
| 遇到的问题 | 多页面入口和旧工具箱/新工具页混用 |
| 最终解决方案 | 正式入口统一到 `/tools` 与 `/tools/[toolId]`；旧入口 `/toolbox/office` 保留兼容提示 |

### 阶段 3：工具箱搭建

| 项目 | 内容 |
| --- | --- |
| 完成内容 | 7 个正式工具：Excel、PDF、合同、报告、PPT、会议、邮件润色 |
| 遇到的问题 | 各工具输入类型不同，既有文件上传也有纯文本、混合输入 |
| 最终解决方案 | `GenericToolPageClient.tsx` 使用 `toolConfigs` 配置化工具；`OfficeToolboxClient.tsx` 保留旧版统一工具箱 |

### 阶段 4：AB 测试

| 项目 | 内容 |
| --- | --- |
| 完成内容 | Excel 新旧版本 A/B 测试系统，包含样本生成、Dify 调用、评分、Markdown/CSV 报告 |
| 遇到的问题 | 新旧工作流 API Key、file variable、tool_type 不同；测试成本和 Token 需要可控 |
| 最终解决方案 | `lib/excel-ab-test.ts` 支持 quick/full 模式，quick 2 个样本，full 10 个样本；内部页面 `/ab-tests/excel` 可直接访问 |

### 阶段 5：官网搭建

| 项目 | 内容 |
| --- | --- |
| 完成内容 | 首页、关于、工具列表、行业方案、定价、联系、隐私政策、服务条款 |
| 遇到的问题 | 公开入口需要统一到新版工具页，避免用户进入旧版工具箱 |
| 最终解决方案 | `SiteHeader` 导航“工具箱”指向 `/tools`；首页/Footer 工具入口指向 `/tools`；`/toolbox/office` 仅兼容 |

### 阶段 6：用户系统

| 项目 | 内容 |
| --- | --- |
| 完成内容 | V1.0 localStorage 注册、登录、退出、Dashboard、本地用户状态 |
| 遇到的问题 | 登录后导航仍显示登录、Dashboard/工具页状态不统一 |
| 最终解决方案 | `SiteHeader` 读取 `getCurrentUser()`；登录后显示用户邮箱/用户中心/退出登录；退出后清理 current user |

### 阶段 7：额度系统

| 项目 | 内容 |
| --- | --- |
| 完成内容 | 注册默认 5 次免费额度；调用前检查；成功后扣 1；使用记录 localStorage 保存 |
| 遇到的问题 | 需要保证失败不扣费、多工具共用额度、A/B 与工具逻辑不受影响 |
| 最终解决方案 | `lib/user-store.ts` 统一 `canUseTool()`、`consumeQuotaAfterSuccess()`、`addUsageRecord()`；工具页只在成功返回有效结果后扣额度 |

### 阶段 8：Prisma 数据库

| 项目 | 内容 |
| --- | --- |
| 完成内容 | 接入 Prisma 5.22 + SQLite；生成 `prisma/dev.db` 和 migration |
| 遇到的问题 | Prisma 7 不再支持 schema 内 datasource url；迁移流程需要兼容本地 `.env` |
| 最终解决方案 | 使用 `prisma@5.22.0`、`@prisma/client@5.22.0`；数据库连接值放在 `.env`，不提交到 Git |

### 阶段 9：Auth API

| 项目 | 内容 |
| --- | --- |
| 完成内容 | `/api/auth/register`、`/api/auth/login`、`/api/auth/logout`、`/api/auth/me` |
| 遇到的问题 | 不能立刻切换前端；不能明文入库；需要本地 session |
| 最终解决方案 | `bcryptjs` 哈希密码；HMAC 签名 httpOnly cookie `office_ai_session`；前端仍继续用 localStorage |

### 阶段 10：行业方案页

| 项目 | 内容 |
| --- | --- |
| 完成内容 | `/solutions` 和 4 个详情页：电商、外贸、企业办公、自媒体 |
| 遇到的问题 | 原“了解方案”只是锚点，没有详情页；用户可能误以为行业工作流已上线 |
| 最终解决方案 | 创建 `/solutions/ecommerce`、`/solutions/trade`、`/solutions/office`、`/solutions/content`；详情页复用 `SolutionDetailPage` |

### 阶段 11：TSX 占位系统

| 项目 | 内容 |
| --- | --- |
| 完成内容 | `WorkflowExperiencePlaceholder.tsx` |
| 遇到的问题 | 真实行业工作流未完成，不能让“立即体验”直接进入不匹配的 `/tools` |
| 最终解决方案 | 点击“立即体验”仅在页面内显示占位提示，提供“体验现有工具”和“联系定制”两个明确选择 |

---

## 第三部分：核心工具

### 3.1 正式工具总览

当前正式工具入口为：

- 工具列表：`/tools`
- 单工具页：`/tools/[toolId]`
- 组件：`components/GenericToolPageClient.tsx`
- 统一后端 API：`/api/toolbox/office`
- 旧版兼容工具箱：`/toolbox/office`

### 3.2 7 个正式工具明细

| 工具 | 页面路径 | 调用方式 | 对应 API | 输入项 | 输出项 | 当前状态 | 是否已验收 | 已知限制 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Excel 数据分析 | `/tools/excel` | 文件上传，FormData | `/api/toolbox/office`，tool_type=`excel_analysis`；旧 API `/api/excel` 仍存在 | `.xlsx`、`.xls`、`.csv`；可选分析目标 | Markdown 数据分析报告 | 正式工具已接入 | 已通过 V1.0 验收 | 建议 20MB 内；复杂/超大表依赖 Dify 工作流能力 |
| PDF 智能总结 | `/tools/pdf` | 文件上传，FormData | `/api/toolbox/office`，tool_type=`pdf_summary`；旧 API `/api/pdf` 仍存在 | `.pdf`；总结深度 | Markdown 摘要、重点、建议 | 正式工具已接入 | 已通过 V1.0 验收 | 暂不支持扫描件 OCR；建议可复制文字 PDF |
| 合同重点提取 | `/tools/contract` | 文件或文本混合输入 | `/api/toolbox/office`，tool_type=`contract_extract` | `.pdf`、`.txt`、`.doc`、`.docx` 或合同文本/关注点 | 合同主体、金额、时间节点、风险点 | 正式工具已接入 | 已通过 V1.0 验收 | 非合同文件会提示改用 PDF 总结；OCR 不支持 |
| 日报周报月报生成 | `/tools/report` | JSON 文本输入 | `/api/toolbox/office`，tool_type=`report_generator`；旧 API `/api/report` 仍存在 | 工作内容、报告类型、语气 | Markdown 报告 | 正式工具已接入 | 已通过 V1.0 验收 | 输出质量取决于输入完整度 |
| PPT 大纲大师 | `/tools/ppt` | JSON 文本输入 | `/api/toolbox/office`，tool_type=`ppt_outline`；旧 API `/api/ppt` 仍存在 | PPT 主题、页数、风格 | Markdown PPT 大纲 | 正式工具已接入 | 已通过 V1.0 验收 | 当前生成大纲，不直接生成 `.pptx` 文件；统一 API 中 PPT 使用 streaming |
| 会议纪要整理 | `/tools/meeting` | JSON 文本输入 | `/api/toolbox/office`，tool_type=`meeting_summary` | 会议记录、是否提取待办 | 会议纪要、结论、待办 | 正式工具已接入 | 已通过 V1.0 验收 | 暂无音频转写，只处理文本 |
| 邮件通知润色 | `/tools/polish` | JSON 文本输入 | `/api/toolbox/office`，tool_type=`email_polish` | 原始内容、类型、语气 | 润色后的邮件/通知/公告 | 正式工具已接入 | 已通过 V1.0 验收 | 不做真实邮件发送 |

### 3.3 工具调用流程

```text
用户打开 /tools/[toolId]
  |
  |-- GenericToolPageClient 根据 toolId 读取 toolConfigs
  |
  |-- 用户输入文本或上传文件
  |
  |-- validateToolInput()
  |
  |-- canUseTool()
        |-- 未登录：提示“请先登录后使用”
        |-- 额度为 0：提示“免费额度已用完，请升级套餐或联系定制”
        |-- 额度充足：继续
  |
  |-- fetch("/api/toolbox/office")
  |
  |-- API Route 上传文件到 Dify 或组装 JSON inputs
  |
  |-- Dify Workflow API
  |
  |-- extractDifyResult()
  |
  |-- 前端展示 Markdown 结果
  |
  |-- consumeQuotaAfterSuccess()
        |-- freeQuota - 1
        |-- addUsageRecord()
```

### 3.4 当前工具相关限制

1. V1.0 额度校验在浏览器 localStorage 中完成，不具备生产防作弊能力。
2. Dify API route 中仍有调试 `console.log` / `console.error`，上线前应进一步收敛日志。
3. 文件处理依赖 Dify Workflow 的读取能力；扫描件 OCR 未接入。
4. PPT 仅生成大纲，不生成真实 PPT 文件。
5. 当前 Word/PDF/PPT/Excel 导出能力不完整；工具页有部分结果复制和 Word 下载能力，但不是完整办公文件生成链路。

---

## 第四部分：AB 测试记录

### 4.1 AB 测试对象

| 项目 | 说明 |
| --- | --- |
| 旧版 | Excel V1.0 / 旧版 Excel 工作流 |
| 新版 | Excel V1.3.2 / 新版 Excel 工作流 |
| 页面 | `/ab-tests/excel` |
| API | `/api/ab-tests/excel` |
| 核心逻辑 | `lib/excel-ab-test.ts` |
| 客户端 | `components/ExcelAbTestClient.tsx` |

### 4.2 测试模式

| 模式 | 样本数 | 旧版调用 | 新版调用 | 估算旧版 Token | 估算新版 Token | 说明 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| quick | 2 | 2 | 2 | 160,000 | 16,000 | 快速验证 API、输出、评分 |
| full | 10 | 10 | 10 | 800,000 | 80,000 | 完整验证多类 Excel 场景 |

### 4.3 评分维度

`lib/excel-ab-test.ts` 中评分维度包括：

| 评分项 | 权重/作用 |
| --- | --- |
| 字段识别 | 重点比较表头、关键字段识别 |
| 数据完整性 | 行数、列数、重点字段覆盖 |
| 异常识别 | 异常值、缺失、离群值等 |
| 类型识别 | 数值、日期、时长等字段类型 |
| 成功率 | 是否返回可展示结果 |
| Token 使用 | 对比新旧版 Token 成本 |
| 综合评分 | `fieldScore * 0.4 + integrityScore * 0.25 + anomalyScore * 0.15 + tokenScore * 0.1 + successScore * 0.1` |

### 4.4 测试样本覆盖

当前代码内生成的测试样本包括：

- 标准销售数据
- 财务预算表
- 项目管理表
- 无表头数字表
- 多 Sheet 业务表
- 缺失值和异常订单表
- 视频时长表
- 中文/英文混数字文本表
- 空表
- 5563 行 × 16 列大运营表

### 4.5 当前结论和决策

| 项目 | 状态 |
| --- | --- |
| 最终产品决策 | 新版 Excel V1.3.2 已正式替换旧版 |
| AB 系统是否删除 | 不删除 |
| 保留原因 | 用于未来 Excel V1.4 / V1.5 / V2.0 工作流升级验证 |
| 对普通用户开放 | 否 |
| 公开入口 | 已从普通页面隐藏 |
| 直接访问 | `/ab-tests/excel` 仍可打开 |
| 页面提示 | 顶部提示“这是内部研发测试页面，用于验证 Excel 工作流版本升级，不面向普通用户开放。” |

---

## 第五部分：网站页面清单

### 5.1 主要页面

| 页面 | 路由 | 状态 | 说明 |
| --- | --- | --- | --- |
| 首页 | `/` | 已完成 | 官网主入口，含工具、方案、CTA、Footer |
| 关于 | `/about` | 已完成 | 项目介绍页面 |
| 工具列表 | `/tools` | 已完成 | 正式工具入口，展示 7 个正式工具 |
| 单工具页 | `/tools/[toolId]` | 已完成 | 支持 `excel`、`pdf`、`contract`、`report`、`ppt`、`meeting`、`polish` |
| 电商工具页 | `/tools/ecommerce` | 存在 | 独立电商页面存在；同时 `/api/ecommerce` 也存在 |
| 定价 | `/pricing` | 已完成 | 定价展示页，曾修复 React key 重复问题 |
| 联系 | `/contact` | 已完成 | 联系定制页面 |
| 登录 | `/login` | 已完成（V1.0 前端） | 仍调用 localStorage 用户系统 |
| 注册 | `/register` | 已完成（V1.0 前端） | 注册后本地默认额度 5 次 |
| Dashboard | `/dashboard` | 已完成（V1.0 前端） | 显示本地用户、额度、使用记录、订单占位、升级占位 |
| 隐私政策 | `/privacy` | 已完成 | 法务/隐私说明 |
| 服务条款 | `/terms` | 已完成 | 服务条款说明 |
| 行业方案列表 | `/solutions` | 已完成 | 当前 4 个行业方案 |
| 电商方案详情 | `/solutions/ecommerce` | 前端占位 | 详情页存在，行业工作流未上线 |
| 外贸方案详情 | `/solutions/trade` | 前端占位 | 详情页存在，行业工作流未上线 |
| 企业办公方案详情 | `/solutions/office` | 前端占位 | 详情页存在，行业工作流未上线 |
| 自媒体内容方案详情 | `/solutions/content` | 前端占位 | 详情页存在，行业工作流未上线 |
| 旧版统一工具箱 | `/toolbox/office` | 兼容保留 | 顶部提示推荐使用新版 `/tools` |
| Excel AB 测试 | `/ab-tests/excel` | 内部工具 | 可直接访问，但无公开入口 |

### 5.2 API 页面/接口

| API | 状态 | 说明 |
| --- | --- | --- |
| `/api/toolbox/office` | 已接入 Dify | 统一 7 工具主 API |
| `/api/excel` | 旧/单工具 API | Excel 文件上传 API，仍存在 |
| `/api/pdf` | 旧/单工具 API | PDF 文件上传 API，仍存在 |
| `/api/report` | 旧/单工具 API | 报告生成 API，仍存在 |
| `/api/ppt` | 旧/单工具 API | PPT 大纲 API，仍存在 |
| `/api/ecommerce` | 独立电商 API | 电商文案相关 API，仍存在 |
| `/api/ab-tests/excel` | 内部研发 API | Excel A/B 测试 |
| `/api/auth/register` | 已真实接 Prisma | bcryptjs hash，创建用户和默认额度 |
| `/api/auth/login` | 已真实接 Prisma | bcryptjs compare，设置 session cookie |
| `/api/auth/logout` | 已真实接 Prisma session | 清除 cookie |
| `/api/auth/me` | 已真实接 Prisma session | 返回当前 session 用户 |
| `/api/quota/me` | 已真实读取数据库 | 未登录 401；缺额度自动创建 |
| `/api/usage-records` GET | 已真实读取数据库 | 只读当前 session 用户记录 |
| `/api/usage-records` POST | 占位 | 不信任前端直接写记录 |
| `/api/payment/create-order` | 占位 | 不接真实支付 |
| `/api/payment/webhook` | 占位 | 注释说明真实支付必须验证签名 |

---

## 第六部分：用户系统

### 6.1 当前前端用户系统：localStorage V1.0

当前前端 `/login`、`/register`、`/dashboard`、`SiteHeader` 和工具调用前检查，仍使用 `lib/user-store.ts`。

| 功能 | 当前状态 |
| --- | --- |
| 注册 | 已完成，邮箱 + 密码 + 确认密码 |
| 登录 | 已完成，邮箱 + 密码 |
| 退出 | 已完成，清除 current user |
| Dashboard | 已完成，显示本地用户、额度、使用记录 |
| 历史记录 | 已完成，本地按用户隔离 |
| 免费额度 | 新用户默认 5 次 |
| 扣额度 | 工具成功返回有效结果后扣 1 |
| 增加额度函数 | `addQuota()`、`updateUserQuotaAfterPayment()` 已预留 |

### 6.2 localStorage 数据结构

`lib/user-store.ts`：

```ts
type LocalUser = {
  id: string;
  email: string;
  password: string; // demo only
  freeQuota: number;
  createdAt: string;
  planName: "免费体验版";
};

type UsageRecord = {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  createdAt: string;
  inputType: string;
  status: "success";
  quotaUsed: 1;
};
```

### 6.3 localStorage key

| Key | 用途 |
| --- | --- |
| `ai_toolbox_users_v1` | 保存本地用户列表 |
| `ai_toolbox_current_user_id_v1` | 当前登录用户 ID |
| `ai_toolbox_usage_records_v1` | 使用记录 |

### 6.4 Dashboard 当前能力

组件：`components/DashboardClient.tsx`

| 区域 | 当前状态 |
| --- | --- |
| 当前邮箱 | 显示 localStorage 当前用户邮箱 |
| 当前套餐 | 免费体验版 |
| 剩余额度 | 来自 `user.freeQuota` |
| 已使用次数 | 本地 usage records 累计 |
| 历史记录 | 支持按工具筛选、时间排序 |
| 订单 | 显示暂无订单 |
| 升级套餐 | 前端占位弹窗：“支付系统暂未接入，如需增加额度，请联系定制服务。” |
| 未登录访问 | 页面内提示登录/注册 |

### 6.5 当前限制

1. localStorage 可被用户修改，不具备生产防作弊能力。
2. localStorage demo 中密码为本地明文保存，代码注释已说明生产必须服务端哈希。
3. 前端工具调用仍以 localStorage 判断额度，不是服务端强校验。
4. 当前真实 Auth API 已存在，但前端登录注册尚未切换。

---

## 第七部分：生产化系统

### 7.1 Prisma / SQLite

| 项目 | 当前状态 |
| --- | --- |
| Prisma 版本 | `5.22.0` |
| Prisma Client | 已生成 |
| 数据库 | SQLite |
| 数据库文件 | `prisma/dev.db` |
| 环境变量 | `.env` 中保存本地 `DATABASE_URL`，`.env` 已被 Git 忽略 |
| migration | `prisma/migrations/20260603100745_init/migration.sql` |

### 7.2 数据表结构

| 表 | 字段 | 当前用途 |
| --- | --- | --- |
| `users` | `id`、`email`、`password_hash`、`created_at`、`updated_at` | 后端真实用户 |
| `user_quotas` | `id`、`user_id`、`total_quota`、`used_quota`、`remaining_quota`、`updated_at` | 后端额度 |
| `usage_records` | `id`、`user_id`、`tool_id`、`tool_name`、`input_type`、`status`、`quota_used`、`created_at` | 后端使用记录 |
| `orders` | `id`、`user_id`、`plan_name`、`amount`、`quota_amount`、`payment_provider`、`payment_status`、`payment_trade_no`、`created_at`、`paid_at` | 支付订单预留 |

### 7.3 Auth API

| API | 当前完成内容 | 未完成内容 |
| --- | --- | --- |
| `POST /api/auth/register` | 校验邮箱/密码；bcrypt hash；写 `users`；创建默认 `user_quotas`；设置 session cookie | 前端未切换；生产 session secret 未配置 |
| `POST /api/auth/login` | 查库；bcrypt compare；设置 session cookie | 前端未切换；无找回密码 |
| `POST /api/auth/logout` | 清除 session cookie | 前端未切换 |
| `GET /api/auth/me` | 从 httpOnly cookie 读取用户并查库 | 前端未切换 |

Session cookie：

| 项目 | 当前值 |
| --- | --- |
| 名称 | `office_ai_session` |
| httpOnly | true |
| sameSite | lax |
| path | `/` |
| maxAge | 7 天 |
| secure | production 环境 true，开发 false |
| 签名 | HMAC SHA256 |

代码注释说明：生产环境应设置 `AUTH_SESSION_SECRET`，并评估 Auth.js / NextAuth / 更成熟 session 方案。

### 7.4 Quota API

| API | 当前完成内容 | 未完成内容 |
| --- | --- | --- |
| `GET /api/quota/me` | 读取当前 session 用户；查 `user_quotas`；无记录自动创建默认 5；未登录返回 401 | 前端 Dashboard 未切换 |

`lib/server-quota.ts` 已有：

- `getServerQuota(userId)`
- `canUseToolServer(userId)`
- `consumeQuotaAfterToolSuccess(userId, toolInfo)`
- `addQuotaAfterPayment(userId, amount, orderInfo)`

这些函数尚未接入正式工具调用链路。

### 7.5 Usage API

| API | 当前完成内容 | 未完成内容 |
| --- | --- | --- |
| `GET /api/usage-records` | 当前 session 用户记录，按 `createdAt desc` 返回 | Dashboard 未切换 |
| `POST /api/usage-records` | 仅占位，说明不信任前端写记录 | 应由服务端工具成功后写入 |

### 7.6 Payment API Skeleton

| API | 当前状态 |
| --- | --- |
| `POST /api/payment/create-order` | 返回 mock order；未接微信/支付宝 |
| `POST /api/payment/webhook` | 返回占位；注释说明真实 webhook 必须验签、防重放、幂等 |

### 7.7 未来真实数据库接入步骤

1. 将前端 `/login`、`/register` 逐步切到 `/api/auth/*`。
2. Dashboard 改读 `/api/auth/me`、`/api/quota/me`、`/api/usage-records`。
3. 工具调用改为服务端鉴权：API route 内读取 session。
4. 工具 API 先 `canUseToolServer()`，额度不足不调用 Dify。
5. Dify 成功返回后，在服务端事务内扣额度并写 `usage_records`。
6. 保留 localStorage demo fallback 一段时间，完成迁移后再清理。

### 7.8 未来真实支付接入步骤

1. 接微信支付/支付宝服务端 SDK 或 HTTP API。
2. 创建真实订单，写入 `orders`。
3. 前端只负责发起支付，不负责增加额度。
4. 支付平台 webhook 回调必须验签。
5. webhook 内幂等更新订单状态和额度。
6. 调用 `addQuotaAfterPayment()` 或其生产版本，事务内增加额度。

---

## 第八部分：行业方案系统

### 8.1 当前方案

数据文件：`app/solutions/solution-data.ts`

| 方案 | 路由 | 当前状态 |
| --- | --- | --- |
| 电商运营 AI 方案 | `/solutions/ecommerce` | 详情页已完成，工作流未上线，使用 TSX 占位 |
| 外贸跟单 AI 方案 | `/solutions/trade` | 详情页已完成，工作流未上线，使用 TSX 占位 |
| 企业办公自动化 AI 方案 | `/solutions/office` | 详情页已完成，工作流未上线，使用 TSX 占位 |
| 自媒体内容 AI 方案 | `/solutions/content` | 详情页已完成，工作流未上线，使用 TSX 占位 |

### 8.2 详情页结构

共享组件：`app/solutions/SolutionDetailPage.tsx`

每个详情页包含：

- 行业介绍
- 典型痛点
- AI 解决方案
- 对应工具列表
- 使用流程图
- 联系定制按钮
- 立即体验占位按钮

### 8.3 TSX 占位系统

组件：`app/solutions/WorkflowExperiencePlaceholder.tsx`

行为：

1. 用户点击“立即体验”。
2. 不跳转真实工具页。
3. 不使用 `alert`。
4. 页面内显示提示：
   “该行业专属 AI 工作流正在搭建中，暂时无法直接体验。你可以先体验现有 AI 办公工具，或联系我们定制该方案。”
5. 提示区提供：
   - “体验现有工具” → `/tools`
   - “联系定制” → `/contact`

组件支持 props：

- `dark`
- `solutionName`
- `buttonText`
- `message`

### 8.4 为什么使用占位

当前行业方案只是组合方案展示，并未搭建“电商工作流”“外贸工作流”“企业办公工作流”“自媒体工作流”四套真实专属 Workflow。如果直接让“立即体验”跳 `/tools`，用户可能误以为行业专属工作流已上线。因此使用 TSX 占位提示，明确区分：

- 现有 7 个 AI 办公工具：已可体验
- 行业专属工作流：正在搭建
- 定制方案：通过 `/contact` 沟通

### 8.5 未来替换方式

后续行业工作流上线后，可替换 `WorkflowExperiencePlaceholder` 为真实路由，例如：

- `/tools/industry/ecommerce`
- `/tools/industry/trade`
- `/tools/industry/office`
- `/tools/industry/content`

替换时需要同步：

1. 新增真实工具页。
2. 新增对应 API route。
3. 服务端接入真实额度校验。
4. 成功调用后写数据库 usage records。
5. 再移除或降级占位提示。

---

## 第九部分：已解决的重要 Bug

### 9.1 Workflow 混用 / 分支未命中

| 项目 | 内容 |
| --- | --- |
| 问题 | Dify Workflow 根据 `tool_type` 分支执行，字段不一致会导致 outputs 为空或 total_tokens 为 0 |
| 原因 | 前端、旧 API、统一工具箱、A/B 测试之间 tool_type 命名不统一 |
| 解决方案 | `/api/toolbox/office` 支持多种 tool_type case；AB 测试允许配置 `EXCEL_AB_*_TOOL_TYPE`；空 outputs 时返回明确错误 |

### 9.2 504 / PPT 超时

| 项目 | 内容 |
| --- | --- |
| 问题 | PPT 大纲生成在 blocking 模式下容易超时 |
| 原因 | PPT 输出较长，Dify blocking 请求耗时高 |
| 解决方案 | `/api/toolbox/office` 对 `ppt_outline` 使用 `runWorkflowStreaming()`，解析 SSE 最终结果 |

### 9.3 React Key 重复

| 项目 | 内容 |
| --- | --- |
| 问题 | 定价页出现 `Encountered two children with the same key, 支持/不支持` |
| 原因 | map 渲染中使用重复文本作为 key |
| 解决方案 | 改为组合稳定唯一 key，如 label/index、feature/index、plan/featureIndex |

### 9.4 文件上传布局变形

| 项目 | 内容 |
| --- | --- |
| 问题 | 长文件名或长输出撑破页面布局 |
| 原因 | 双栏布局和上传文件名没有稳定 min-width/overflow 处理 |
| 解决方案 | 上传文件名 truncate；输入/输出区 `min-w-0`；输出区域内部滚动 |

### 9.5 扫描 PDF 提示不准确

| 项目 | 内容 |
| --- | --- |
| 问题 | 扫描件或图片型 PDF 曾提示“未检测到 PDF 文档” |
| 原因 | 实际是无法提取文字，不是文件不是 PDF |
| 解决方案 | 提示改为“当前版本暂不支持 OCR，请上传可复制文字的文档” |

### 9.6 合同误识别

| 项目 | 内容 |
| --- | --- |
| 问题 | 非合同文件上传到合同工具时被强行按合同分析 |
| 原因 | 合同 Workflow 没有先判断文档类型 |
| 解决方案 | `buildContractInstruction()` 要求先判断是否合同/协议类；非合同建议改用 PDF 智能总结 |

### 9.7 输出残留

| 项目 | 内容 |
| --- | --- |
| 问题 | 切换工具后可能残留上一个工具结果 |
| 原因 | 工具切换时状态未完全重置 |
| 解决方案 | `GenericToolPageClient` 和 `OfficeToolboxClient` 切换工具时清理输入、文件、结果、错误、loading 状态 |

### 9.8 登录状态混乱

| 项目 | 内容 |
| --- | --- |
| 问题 | 登录后顶部仍显示“登录”，可再次进入登录页 |
| 原因 | `SiteHeader` 未统一读取 localStorage 当前用户 |
| 解决方案 | `SiteHeader` 使用 `getCurrentUser()`，监听 `storage` 和 `ai-toolbox-user-updated` 事件 |

### 9.9 工具入口混乱

| 项目 | 内容 |
| --- | --- |
| 问题 | 首页、Dashboard、导航、旧工具箱、新工具页路径混用 |
| 原因 | `/toolbox/office` 和 `/tools/[toolId]` 并存 |
| 解决方案 | 正式入口统一到 `/tools`；`/toolbox/office` 保留兼容并提示前往新版 |

### 9.10 行业方案“立即体验”误导

| 项目 | 内容 |
| --- | --- |
| 问题 | 行业专属工作流未上线，但详情页“立即体验”可能让用户误以为已可用 |
| 原因 | 方案页是介绍页，不是真实行业工作流 |
| 解决方案 | 新增 `WorkflowExperiencePlaceholder`，点击后页面内提示“正在搭建中”，并给出现有工具和联系定制入口 |

---

## 第十部分：当前完成度评估

| 维度 | 评分 | 说明 |
| --- | ---: | --- |
| 产品完成度 | 82 / 100 | 官网、7 个工具、工具列表、登录注册、Dashboard、隐私条款、行业方案均可演示；但行业专属工作流、支付、OCR、长文档仍未完成 |
| 技术完成度 | 78 / 100 | Next.js 架构、Dify 调用、Prisma/SQLite/Auth API/Quota API 已具备；但前端仍未切到真实后端，工具额度仍是 localStorage |
| 商业化完成度 | 55 / 100 | 可用于获客和演示；但不能直接收费，缺真实支付、服务端额度强校验、真实订单、生产数据库 |

### 10.1 评分依据

产品层面：

- 已具备完整官网和工具入口。
- 7 个工具可演示。
- Dashboard 和额度体验已可展示。
- 行业方案页完整，但工作流未上线。

技术层面：

- Dify 调用链路可用。
- Prisma 本地数据库可用。
- Auth API 已真实接数据库。
- 但真实后端还未接入前端工具调用。

商业化层面：

- 没有真实支付。
- 没有服务端扣费闭环。
- localStorage 可被篡改。
- 用户账号系统前端还不是生产版。

---

## 第十一部分：上线前状态

### 11.1 已经可以上线/展示的部分

| 模块 | 状态 |
| --- | --- |
| 官网页面 | 可上线展示 |
| 工具列表 `/tools` | 可上线展示 |
| 7 个 AI 工具 | 可演示使用 |
| localStorage 用户系统 | 可用于 MVP 演示 |
| Dashboard | 可用于本地演示 |
| 隐私政策 / 服务条款 | 可展示 |
| 行业方案页 | 可展示，但“立即体验”为占位 |
| 联系页 | 可用于收集定制意向 |
| AB 测试 | 内部可用 |

### 11.2 还不能收费的部分

| 模块 | 为什么不能收费 |
| --- | --- |
| localStorage 额度 | 用户可篡改，不具备安全边界 |
| 前端用户系统 | 仍使用 localStorage demo，不是生产账号体系 |
| 工具调用扣费 | 扣费发生在浏览器，不是服务端事务 |
| 支付系统 | 只有占位 API，没有真实支付 |
| 订单系统 | 只有 Prisma 表和支付 skeleton，没有真实订单流程 |
| 行业专属工作流 | 只有详情页和占位提示，真实 Workflow 未搭建 |

### 11.3 当前最大风险

1. 误把 localStorage 额度当作生产计费系统。
2. 工具调用成本不可控：服务端尚未强制校验额度。
3. Dify API route 中有较多调试日志，上线前要收敛。
4. OCR 和长文档处理能力不足，容易在真实用户上传扫描件/大文件时失败。
5. 行业方案工作流未上线，必须继续保持占位提示。

---

## 第十二部分：下一阶段路线图

### P1：上线获客和收费前必须项

| 优先级 | 任务 | 说明 |
| --- | --- | --- |
| P1 | 将登录/注册切换到 Auth API | 前端从 localStorage 迁移到 `/api/auth/*` |
| P1 | Dashboard 切换到数据库 | 读取 `/api/auth/me`、`/api/quota/me`、`/api/usage-records` |
| P1 | 工具调用服务端额度校验 | API route 内读取 session、查额度、调用 Dify、成功后事务扣额度 |
| P1 | 支付 webhook 接入 | 支付成功只能以后端 webhook 为准 |
| P1 | 日志清理 | 去除生产环境敏感/冗余 Dify 调试日志 |
| P1 | 真实部署配置 | 配置生产数据库、session secret、环境变量 |

### P2：产品增强

| 优先级 | 任务 | 说明 |
| --- | --- | --- |
| P2 | OCR | 支持扫描 PDF、图片型 PDF、拍照文件 |
| P2 | 长文档分块 | 长 PDF / 大 Word / 大表格分块总结 |
| P2 | 导出能力 | Word、PDF、PPT、Excel 分析报告导出 |
| P2 | 结果历史详情 | 数据库持久化结果内容和再次下载 |
| P2 | 案例页 | 真实案例/演示案例沉淀获客 |
| P2 | 短视频获客页面 | 面向抖音/小红书等流量渠道做落地页 |

### P3：业务扩展

| 优先级 | 任务 | 说明 |
| --- | --- | --- |
| P3 | 第二工具箱 | 复用当前架构开发新垂直工具箱 |
| P3 | 行业专属工作流 | 电商、外贸、办公、自媒体各自真实 Workflow |
| P3 | 企业版 | 团队额度、团队成员、企业订单 |
| P3 | 模板市场 | 常用报告、合同、邮件、PPT 模板 |
| P3 | 多模型/多工作流调度 | 根据任务类型选择不同 Dify Workflow |

---

## 第十三部分：开发者备注

### 13.1 当前最重要结论

1. V1.0 已经可以作为 MVP 演示和获客入口。
2. 当前不能直接作为收费系统上线，因为额度和工具扣费仍在 localStorage。
3. Prisma/Auth/Quota API 是 V1.1 准备层，已经存在，但前端尚未切换。
4. `/tools` 是正式工具入口，`/toolbox/office` 只是旧版兼容入口。
5. `/ab-tests/excel` 是内部研发工具，不要重新做一套，也不要公开展示入口。
6. 行业方案页不是行业工作流上线，继续保留 TSX 占位，直到真实工作流完成。

### 13.2 不要重复开发的内容

| 不要重复做 | 原因 |
| --- | --- |
| 7 个正式工具基础页面 | 已在 `GenericToolPageClient.tsx` 配置化完成 |
| localStorage 用户/额度演示 | 已在 `lib/user-store.ts` 完成 |
| Dashboard 本地记录展示 | 已在 `DashboardClient.tsx` 完成 |
| Prisma schema | 已有 `users`、`user_quotas`、`usage_records`、`orders` |
| Auth API | 已有注册、登录、退出、当前用户 |
| Excel AB 测试 | 已有完整样本、评分、报告、CSV/Markdown 下载 |
| 行业方案详情页结构 | 已有 `SolutionDetailPage.tsx` |
| 行业工作流占位 | 已有 `WorkflowExperiencePlaceholder.tsx` |

### 13.3 哪些东西已经完成

- 官网基础页面。
- 7 个正式工具。
- 新版工具入口 `/tools`。
- 单工具页 `/tools/[toolId]`。
- 旧版兼容 `/toolbox/office`。
- localStorage 用户系统。
- localStorage 额度系统。
- Dashboard 本地记录和额度展示。
- 隐私政策和服务条款。
- Excel A/B 测试内部系统。
- Prisma SQLite 本地数据库。
- 后端 Auth API。
- 后端 Quota API 读取。
- 后端 Usage API 读取。
- 支付 API skeleton。
- 4 个行业方案详情页。
- 行业方案 TSX 占位交互。

### 13.4 哪些东西不要再折腾

1. 不要继续优化 localStorage 防作弊；它只能作为 demo。
2. 不要把行业方案“立即体验”直接跳 `/tools`；真实工作流未完成前必须保留占位。
3. 不要删除 A/B 测试系统；未来 Excel 升级仍需要它。
4. 不要继续扩展旧版 `/toolbox/office`；正式入口是 `/tools`。
5. 不要在前端直接增加额度；生产必须由后端支付回调增加额度。

### 13.5 下一步应该把精力放在哪里

优先级最高的是商业化闭环：

```text
真实 Auth 前端接入
  -> Dashboard 接数据库
  -> 工具 API 服务端额度校验
  -> Dify 成功后服务端扣额度
  -> 使用记录写数据库
  -> 支付创建订单
  -> 支付 webhook 验签并加额度
```

其次是获客：

- 首页和行业方案页继续做转化。
- 做案例内容。
- 做短视频/小红书/公众号获客素材。
- 用 `/contact` 承接定制咨询。

最后再做高级能力：

- OCR。
- 长文档。
- 导出。
- 行业专属工作流。
- 第二、第三、第四工具箱。

---

## 附录 A：关键文件索引

| 文件 | 说明 |
| --- | --- |
| `app/page.tsx` | 首页 |
| `components/SiteHeader.tsx` | 顶部导航，读取 localStorage 登录状态 |
| `app/tools/page.tsx` | 工具列表页面 |
| `app/tools/[toolId]/page.tsx` | 单工具动态路由 |
| `components/GenericToolPageClient.tsx` | 新版正式工具页客户端 |
| `app/toolbox/office/page.tsx` | 旧版工具箱兼容入口 |
| `components/OfficeToolboxClient.tsx` | 旧版统一工具箱客户端 |
| `app/api/toolbox/office/route.ts` | 统一 7 工具 Dify API |
| `lib/dify.ts` | Dify 文件上传、Workflow 调用、结果提取 |
| `lib/user-store.ts` | V1.0 localStorage 用户/额度/记录系统 |
| `components/AuthPageClient.tsx` | V1.0 前端登录/注册页 |
| `components/DashboardClient.tsx` | V1.0 Dashboard |
| `prisma/schema.prisma` | 数据库 schema |
| `lib/prisma.ts` | Prisma Client 单例 |
| `lib/server-auth.ts` | V1.1 后端 Auth 逻辑 |
| `lib/server-quota.ts` | V1.1 后端 Quota 逻辑 |
| `app/api/auth/*` | V1.1 Auth API |
| `app/api/quota/me/route.ts` | V1.1 Quota API |
| `app/api/usage-records/route.ts` | V1.1 Usage API |
| `app/api/payment/*` | 支付占位 API |
| `lib/excel-ab-test.ts` | Excel A/B 测试核心逻辑 |
| `components/ExcelAbTestClient.tsx` | Excel A/B 测试页面 |
| `app/solutions/solution-data.ts` | 行业方案数据 |
| `app/solutions/SolutionDetailPage.tsx` | 行业方案详情页共享结构 |
| `app/solutions/WorkflowExperiencePlaceholder.tsx` | 行业工作流未上线占位组件 |

## 附录 B：环境变量索引

> 不在本文档记录真实 API Key。

| 变量 | 用途 |
| --- | --- |
| `DIFY_BASE_URL` | Dify API base URL |
| `TOOLBOX_OFFICE_API_KEY` | 统一办公工具箱 Dify API Key |
| `REPORT_API_KEY` | 报告 API Key |
| `REPORT_WORKFLOW_ID` | 报告 Workflow ID |
| `ECOMMERCE_API_KEY` | 电商 API Key |
| `ECOMMERCE_WORKFLOW_ID` | 电商 Workflow ID |
| `EXCEL_API_KEY` | Excel API Key |
| `EXCEL_WORKFLOW_ID` | Excel Workflow ID |
| `PDF_API_KEY` | PDF API Key |
| `PDF_WORKFLOW_ID` | PDF Workflow ID |
| `PPT_API_KEY` | PPT API Key |
| `PPT_WORKFLOW_ID` | PPT Workflow ID |
| `EXCEL_AB_OLD_API_KEY` | Excel AB 旧版专用 API Key |
| `EXCEL_AB_OLD_TOOL_TYPE` | Excel AB 旧版 tool_type |
| `EXCEL_AB_OLD_FILE_VARIABLE` | Excel AB 旧版文件变量 |
| `EXCEL_AB_NEW_API_KEY` | Excel AB 新版专用 API Key |
| `EXCEL_AB_NEW_TOOL_TYPE` | Excel AB 新版 tool_type |
| `EXCEL_AB_NEW_FILE_VARIABLE` | Excel AB 新版文件变量 |
| `DATABASE_URL` | Prisma SQLite 数据库 |
| `AUTH_SESSION_SECRET` | 生产建议配置的 session secret |

---

## 最终状态摘要

AI办公工具箱当前处于：

```text
V1.0 MVP：可演示、可获客、可继续开发
V1.1 后端收费架构：已完成 Prisma/Auth/Quota/Usage/API 骨架和局部真实能力
商业化收费：尚未完成，不能直接收费上线
```

当前最稳妥的下一步不是继续堆页面，而是把真实后端用户、额度、支付闭环接起来。
