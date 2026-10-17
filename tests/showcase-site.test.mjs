import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const baseUrl = "http://127.0.0.1:3110";

let server;
let serverOutput = "";

before(
  async () => {
    server = spawn(process.execPath, [nextBin, "dev", "--hostname", "127.0.0.1", "--port", "3110"], {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });

    server.stdout.on("data", (chunk) => {
      serverOutput += chunk.toString();
    });
    server.stderr.on("data", (chunk) => {
      serverOutput += chunk.toString();
    });

    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (server.exitCode !== null) {
        throw new Error(`Next.js test server exited early.\n${serverOutput}`);
      }

      try {
        const response = await fetch(baseUrl);
        if (response.ok) return;
      } catch {
        // The server is still starting.
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`Next.js test server did not become ready.\n${serverOutput}`);
  },
  { timeout: 45_000 }
);

after(() => {
  server?.kill();
});

async function getPage(route) {
  const response = await fetch(`${baseUrl}${route}`);
  return { status: response.status, html: await response.text() };
}

function includes(html, value) {
  return html.includes(value);
}

test("home is service-first while legacy commercial routes stay reachable but unlinked", async () => {
  const home = await getPage("/");
  assert.equal(home.status, 200);
  assert.equal(includes(home.html, 'href="/solutions"'), false, "home must not link to /solutions");
  assert.equal(includes(home.html, 'href="/pricing"'), false, "home must not link to /pricing");
  assert.equal(includes(home.html, 'href="/contact"'), true, "home must surface the enquiry entry");

  for (const route of ["/solutions", "/pricing", "/contact"]) {
    const page = await getPage(route);
    assert.equal(page.status, 200);
  }
});

test("every page shares one service-first shell with a working mobile menu", async () => {
  for (const route of ["/", "/tools", "/about", "/contact"]) {
    const page = await getPage(route);

    for (const label of ["能做什么", "做过的", "免费工具", "技术演示"]) {
      assert.equal(includes(page.html, label), true, `${route} shell must contain ${label}`);
    }

    assert.equal(includes(page.html, 'href="/contact"'), true, `${route} must surface the enquiry entry`);
    assert.equal(includes(page.html, "AI WorkBox"), true, `${route} must carry the brand`);
    assert.equal(includes(page.html, 'aria-expanded="false"'), true, `${route} menu must expose collapsed state`);
    assert.equal(includes(page.html, 'aria-controls="site-mobile-menu"'), true, `${route} menu must identify its region`);
    assert.equal(includes(page.html, 'href="#main-content"'), true, `${route} must keep the skip link`);
    assert.equal(includes(page.html, 'id="main-content"'), true, `${route} must keep the main anchor`);
    assert.doesNotMatch(page.html, /AI办公工具箱/, `${route} must not leak the retired brand name`);
  }
});

test("home sells AI delivery services with pricing, proof and a low-risk first step", async () => {
  const page = await getPage("/");

  for (const service of ["企业知识库问答", "客服 / 售后自动回复", "文档与报表自动化", "其他技术活"]) {
    assert.equal(includes(page.html, service), true, `home must name ${service}`);
  }

  assert.equal(includes(page.html, "¥6,000 起"), true, "home must publish a starting price");
  assert.equal(includes(page.html, "先做小样"), true, "home must offer a low-risk first step");
  assert.equal(includes(page.html, "rag-ticket.aiworkbox.cn"), true, "home must link a runnable demo");
  assert.equal(includes(page.html, "1–3 周"), true, "home must show a delivery window");
  assert.equal(includes(page.html, 'href="/demos"'), true, "home must link Agent work");
  assert.equal(includes(page.html, 'href="/tools"'), true, "home must link the free tools");
  assert.doesNotMatch(page.html, /行业定制|查看定价|联系定制|商务合作/);
});

test("contact form asks only four things and drops the contradictory budget ladder", async () => {
  const page = await getPage("/contact");
  assert.equal(page.status, 200);

  for (const label of ["怎么称呼", "联系方式", "你现在最想解决的一件事", "预算大概在哪个范围"]) {
    assert.equal(includes(page.html, label), true, `contact must ask: ${label}`);
  }

  // 旧表单的重量级字段必须消失
  for (const retired of ["公司 / 团队名称", "所属行业", "抖音号", "上传示例文件"]) {
    assert.equal(includes(page.html, retired), false, `contact must no longer ask for ${retired}`);
  }

  // 预算档位要和首页报价对齐，且默认一个都不选
  assert.equal(includes(page.html, "500 元以内"), false, "旧预算档位必须去掉");
  assert.equal(includes(page.html, "6,000–15,000"), true, "预算档位必须覆盖首页主价位");
  assert.equal(includes(page.html, "还不确定"), true, "预算要留一个「还不确定」的出口");
  assert.equal(
    (page.html.match(/aria-pressed="false"/g) ?? []).length >= 5,
    true,
    "预算 chip 默认必须全部未选中"
  );
});

test("tool browsing and result states are accessible and explicit", async () => {
  const overview = await getPage("/tools");
  assert.equal(overview.status, 200);
  assert.equal(includes(overview.html, 'aria-label="搜索工具名称"'), true, "tool search must have an accessible label");
  assert.equal(includes(overview.html, 'aria-pressed="true"'), true, "active filter must expose pressed state");
  assert.equal(includes(overview.html, 'href="/#solutions"'), false, "tool overview must not surface industry solutions CTA");

  const detail = await getPage("/tools/excel");
  assert.equal(detail.status, 200);
  assert.equal(
    includes(detail.html, "完成左侧输入后，AI 生成结果将在这里展示。"),
    true,
    "tool result panel must explain its empty state"
  );
});

test("about page explains AI engineering depth without sales positioning", async () => {
  const page = await getPage("/about");
  assert.equal(page.status, 200);
  for (const evidence of ["AI 应用工程", "RAG", "MCP", "评测"]) {
    assert.equal(includes(page.html, evidence), true, `about page must contain ${evidence}`);
  }
  assert.equal(includes(page.html, 'href="/demos"'), true, "about page must lead to project evidence");
  assert.equal(
    includes(page.html, "github.com/yan073747/ai-office-toolbox"),
    true,
    "about page must link to the source repository"
  );
});
