import PaymentOrderPageClient from "@/components/PaymentOrderPageClient";

type PaymentOrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function PaymentOrderPage({ params }: PaymentOrderPageProps) {
  const { orderId } = await params;
  return <PaymentOrderPageClient orderId={orderId} />;
}
