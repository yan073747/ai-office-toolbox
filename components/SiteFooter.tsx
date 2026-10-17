import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-paper px-5 pb-9 pt-8 text-[12.5px] leading-[1.7] text-mute">
      <div className="mx-auto max-w-site">
        <div className="grid gap-6 border-b border-wline2 pb-6 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-8">
          <div>
            <b className="block text-[13px] font-semibold text-inkd">AI WorkBox</b>
            <p className="mt-1">企业 AI 落地 · 一个人做</p>
            <p>佛山市顺德区 · 全国可远程</p>
          </div>
          <div>
            <b className="block text-[13px] font-semibold text-inkd">能做什么</b>
            <Link href="/#services" className="mt-1 block hover:text-inkd">
              知识库问答
            </Link>
            <Link href="/#services" className="block hover:text-inkd">
              客服自动回复
            </Link>
            <Link href="/#services" className="block hover:text-inkd">
              报表自动化
            </Link>
            <Link href="/#services" className="block hover:text-inkd">
              其他技术活
            </Link>
          </div>
          <div>
            <b className="block text-[13px] font-semibold text-inkd">其他</b>
            <Link href="/#cases" className="mt-1 block hover:text-inkd">
              做过的项目
            </Link>
            <Link href="/tools" className="block hover:text-inkd">
              免费工具
            </Link>
            <Link href="/demos" className="block hover:text-inkd">
              技术演示
            </Link>
            <span className="block">
              <Link href="/privacy" className="hover:text-inkd">
                隐私政策
              </Link>
              <span> · </span>
              <Link href="/terms" className="hover:text-inkd">
                服务条款
              </Link>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 pt-4">
          <span>周一至周六 10:00–20:00　·　平均 2 小时内回消息</span>
          <span>© 2026 AI WorkBox</span>
        </div>
      </div>
    </footer>
  );
}
