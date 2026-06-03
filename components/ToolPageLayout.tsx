import SiteHeader from "@/components/SiteHeader";

export default function ToolPageLayout({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-soft">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-brand">AI 办公工具</p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
