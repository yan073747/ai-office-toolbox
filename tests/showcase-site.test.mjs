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

test("public showcase hides commercial entry points while preserving routes", async () => {
  const home = await getPage("/");
  assert.equal(home.status, 200);
  assert.equal(includes(home.html, 'href="/solutions"'), false, "home must not link to /solutions");
  assert.equal(includes(home.html, 'href="/pricing"'), false, "home must not link to /pricing");
  assert.equal(includes(home.html, 'href="/contact"'), false, "home must not link to /contact");

  for (const route of ["/solutions", "/pricing", "/contact"]) {
    const page = await getPage(route);
    assert.equal(page.status, 200);
  }
});

test("global shell exposes portfolio navigation and accessibility hooks", async () => {
  const page = await getPage("/");
  for (const label of ["首页", "工具演示", "Agent作品集", "关于"]) {
    assert.equal(includes(page.html, label), true, `global shell must contain ${label}`);
  }
  assert.equal(includes(page.html, 'href="#main-content"'), true, "skip link must target main content");
  assert.equal(includes(page.html, 'id="main-content"'), true, "main content anchor must exist");
  assert.equal(includes(page.html, 'aria-expanded="false"'), true, "menu must expose expanded state");
  assert.equal(includes(page.html, 'aria-controls="site-mobile-menu"'), true, "menu must identify controlled region");
});

test("home presents runnable tools and agent engineering evidence", async () => {
  const page = await getPage("/");
  assert.equal(includes(page.html, "可运行的 AI 应用工程作品集"), true, "home must state portfolio positioning");
  assert.equal(includes(page.html, "7 个办公工具"), true, "home must show tool proof");
  assert.equal(includes(page.html, "5 个 Agent 项目"), true, "home must show agent proof");
  assert.equal(includes(page.html, 'href="/demos"'), true, "home must link to Agent work");
  assert.equal(includes(page.html, 'href="/tools/excel"'), true, "home tool cards must deep-link");
  assert.doesNotMatch(page.html, /行业定制|查看定价|联系定制|商务合作/);
});

test("tool browsing and result states are accessible and explicit", async () => {
  const overview = await getPage("/tools");
  assert.equal(overview.status, 200);
  assert.equal(includes(overview.html, 'aria-label="搜索工具名称"'), true, "tool search must have an accessible label");
  assert.equal(includes(overview.html, 'aria-pressed="true"'), true, "active filter must expose pressed state");
  assert.equal(includes(overview.html, 'href="/contact"'), false, "tool overview must not surface contact sales CTA");
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
  assert.equal(includes(page.html, 'href="/contact"'), false, "about page must not surface sales contact CTA");
});
