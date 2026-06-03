import SiteHeader from "@/components/SiteHeader";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "服务条款 | AI办公工具箱",
  description: "AI办公工具箱服务条款，说明服务范围、用户规则、文件上传、AI 生成内容、账号安全和责任限制。"
};

const sections = [
  {
    title: "服务说明",
    content: [
      "AI办公工具箱提供面向办公场景的 AI 工具服务，包括但不限于表格分析、文档总结、合同重点提取、报告生成、PPT 大纲、会议纪要和邮件润色。",
      "本网站会根据产品规划持续调整功能范围、页面展示、工具能力和服务形式。"
    ]
  },
  {
    title: "用户使用规则",
    content: [
      "你应合法、合理地使用本网站，不得利用本服务生成、传播违法违规、侵权、虚假、欺诈、骚扰或危害他人权益的内容。",
      "你不得攻击、干扰、逆向工程、批量滥用或以其他方式影响网站、接口、第三方服务和其他用户的正常使用。"
    ]
  },
  {
    title: "文件上传规范",
    content: [
      "你应确保上传文件拥有合法来源和处理权限，不得上传侵犯他人隐私、知识产权、商业秘密或其他合法权益的内容。",
      "请避免上传高度敏感资料。涉及合同、财务、人事、客户数据等内容时，建议先进行必要脱敏。"
    ]
  },
  {
    title: "AI生成内容说明",
    content: [
      "AI 生成内容基于你提交的信息和模型能力自动生成，可能存在错误、遗漏、偏差或不适用于特定场景的情况。",
      "生成结果仅供参考。重要决策、合同审查、财务分析、法律判断等场景，应由具备资质或经验的专业人员复核。"
    ]
  },
  {
    title: "账号与安全",
    content: [
      "当前部分账号、历史记录、额度和订单能力可能仍处于规划或演示阶段，具体以上线功能为准。",
      "如后续开放账号系统，你应妥善保管账号、密码、验证码等登录凭据，并对账号下的操作承担相应责任。"
    ]
  },
  {
    title: "付费与退款说明",
    content: [
      "当前网站可能展示按次购买、套餐、企业定制等方案信息。实际付费能力、价格、权益和有效期以上线页面或双方确认的服务约定为准。",
      "如发生退款、取消或服务调整，将依据具体购买页面、合同约定或双方沟通确认的规则处理。"
    ]
  },
  {
    title: "服务变更与中断",
    content: [
      "我们可能因系统维护、第三方服务异常、网络故障、产品升级、合规要求或不可抗力等原因变更、暂停或中断部分服务。",
      "我们会尽量降低服务变更或中断对用户的影响，但不承诺服务在任何时间均无错误或不中断。"
    ]
  },
  {
    title: "责任限制",
    content: [
      "在法律允许范围内，AI办公工具箱不对因使用或无法使用本服务、依赖 AI 生成内容、上传不当文件或第三方服务异常造成的间接损失承担责任。",
      "你应自行判断生成内容的准确性、适用性和合规性，并承担使用结果所产生的风险。"
    ]
  },
  {
    title: "条款更新",
    content: [
      "我们可能根据业务发展、功能变化或法律法规要求更新本服务条款。更新后的条款会在本页面展示，并以页面标注的最后更新日期为准。",
      "如果你在条款更新后继续使用本网站，视为你已理解并接受更新后的条款。"
    ]
  },
  {
    title: "联系方式",
    content: [
      "如你对本服务条款、使用规则、付费服务或企业定制有疑问，可以通过联系定制页面与我们沟通。",
      "联系入口：/contact。"
    ]
  }
];

const footerColumns = [
  {
    title: "产品",
    links: [
      { label: "工具箱", href: "/tools" },
      { label: "行业方案", href: "/solutions" },
      { label: "定价", href: "/pricing" },
      { label: "免费体验", href: "/tools" }
    ]
  },
  {
    title: "联系",
    links: [
      { label: "联系定制", href: "/contact" },
      { label: "商务合作", href: "/contact" },
      { label: "使用反馈", href: "/contact" },
      { label: "在线支持", href: "/contact" }
    ]
  },
  {
    title: "条款",
    links: [
      { label: "隐私政策", href: "/privacy" },
      { label: "服务条款", href: "/terms" },
      { label: "数据安全", href: "/privacy" },
      { label: "免责声明", href: "/terms" }
    ]
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[800px]">
          <p className="text-sm font-semibold text-blue-600">AI办公工具箱</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">服务条款</h1>
          <p className="mt-5 text-sm leading-7 text-slate-500">最后更新日期：2026-06-03</p>
          <p className="mt-6 text-base leading-8 text-slate-600">
            欢迎使用 AI办公工具箱。使用本网站及相关 AI 办公工具前，请阅读并理解以下服务条款。
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[800px] space-y-9">
          {sections.map((section, index) => (
            <section key={section.title} className="border-b border-slate-200 pb-8 last:border-b-0 last:pb-0">
              <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.content.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-slate-600">
                    {paragraph === "联系入口：/contact。" ? (
                      <>
                        联系入口：
                        <Link href="/contact" className="font-semibold text-blue-700 transition hover:text-blue-900">
                          /contact
                        </Link>
                        。
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <LegalFooter />
    </main>
  );
}

function LegalFooter() {
  return (
    <footer className="bg-white px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold text-slate-950">AI办公工具箱</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Office AI Toolbox，面向个人、小团队、个体户和中小企业的 AI 办公效率工具网站。
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-slate-950">{column.title}</h3>
            <div className="mt-4 flex flex-col gap-3">
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-slate-600 transition hover:text-slate-950">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 AI办公工具箱. All rights reserved.</p>
        <p>Office AI Toolbox</p>
      </div>
    </footer>
  );
}
