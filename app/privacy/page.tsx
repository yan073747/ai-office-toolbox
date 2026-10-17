import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

export const metadata = {
  title: "隐私政策 | AI WorkBox",
  description: "AI WorkBox隐私政策，说明信息收集、文件上传、数据处理、第三方服务和用户权利。"
};

const sections = [
  {
    title: "我们收集哪些信息",
    content: [
      "当你使用 AI WorkBox时，我们可能会收集你主动提交的信息，例如表单内容、上传文件、联系方式、业务需求描述以及工具使用过程中填写的文本。",
      "在网站运行过程中，我们也可能收集必要的技术信息，例如浏览器类型、访问时间、页面路径、设备信息和服务错误日志，用于保障网站稳定运行。"
    ]
  },
  {
    title: "我们如何使用信息",
    content: [
      "我们会将相关信息用于提供 AI 办公工具服务、处理你的上传内容、生成工具结果、响应咨询需求、排查服务异常以及改进产品体验。",
      "除非取得你的授权，或法律法规另有要求，我们不会将你的个人信息用于与本网站服务无关的目的。"
    ]
  },
  {
    title: "文件上传与数据处理说明",
    content: [
      "当你上传 Excel、CSV、PDF、Word、TXT 或其他支持格式文件时，文件内容会被用于当前工具任务的处理，例如数据分析、文档总结、合同重点提取或报告生成。",
      "请勿上传包含高度敏感信息、国家秘密、商业核心机密、他人隐私或你无权处理的文件。上传前建议自行脱敏。"
    ]
  },
  {
    title: "数据存储说明",
    content: [
      "当前网站主要以即时处理为主，工具生成结果通常只在当前页面展示，刷新页面后可能不会保留。",
      "后续如果上线账号、历史记录、额度管理或订单功能，我们会根据功能需要保存必要数据，并在产品界面或相关政策中说明。"
    ]
  },
  {
    title: "第三方服务说明",
    content: [
      "本网站可能通过第三方 AI 服务或工作流平台处理用户提交的内容，以完成文本生成、文件分析、文档总结等能力。",
      "第三方服务仅用于完成你主动发起的工具请求。不同第三方服务可能有各自的数据处理规则，请在上传敏感内容前谨慎评估。"
    ]
  },
  {
    title: "用户权利",
    content: [
      "你可以停止使用本网站服务，或通过联系方式向我们提出与个人信息相关的查询、更正、删除或撤回授权请求。",
      "在符合法律法规和服务安全要求的前提下，我们会尽力响应你的合理请求。"
    ]
  },
  {
    title: "联系方式",
    content: [
      "如你对隐私政策、数据处理或文件安全有疑问，可以通过网站的联系定制页面提交需求或反馈。",
      "联系入口：/contact。"
    ]
  },
  {
    title: "免责声明",
    content: [
      "AI 生成结果可能存在不准确、不完整或不适用于具体场景的情况。涉及法律、财务、合同、医疗、投资等重要事项时，请结合专业人士意见进行判断。",
      "你应确保上传内容来源合法，并对上传内容及使用生成结果的行为承担相应责任。"
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

export default function PrivacyPage() {
  return (
    <div className="bg-paper text-inkd">
      <SiteHeader />

      <section className="border-b border-wline px-5 pb-7 pt-9 md:pb-9 md:pt-11">
        <div className="mx-auto max-w-[800px]">
          <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">AI WorkBox</p>
          <h1 className="mt-3.5 max-w-[600px] text-[26px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[34px]">隐私政策</h1>
          <p className="mt-3 text-[12.5px] text-mute">最后更新日期：2026-06-03</p>
          <p className="mt-3.5 max-w-[640px] text-[14.5px] leading-[1.95] text-ink2">
            本隐私政策说明 AI WorkBox在提供网站和 AI 办公工具服务时，如何收集、使用、处理和保护相关信息。使用本网站即表示你已阅读并理解本政策。
          </p>
        </div>
      </section>

      <section className="px-5 py-8 md:py-10">
        <div className="mx-auto max-w-[760px] space-y-7">
          {sections.map((section, index) => (
            <section key={section.title} className="border-b border-wline2 pb-6 last:border-b-0 last:pb-0">
              <h2 className="text-[16px] font-semibold tracking-[-0.005em] text-inkd">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-2.5 space-y-3">
                {section.content.map((paragraph) => (
                  <p key={paragraph} className="text-[14px] leading-[1.95] text-ink2">
                    {paragraph === "联系入口：/contact。" ? (
                      <>
                        联系入口：
                        <Link href="/contact" className="font-semibold text-accent transition hover:text-inkd">
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

      <SiteFooter />
    </div>
  );
}
