import WebsiteDetails from "@/components/WebsiteDetails";

interface WebsiteDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function WebsiteDetailsPage({ params }: WebsiteDetailsPageProps) {
  const { id } = await params;

  return <WebsiteDetails websiteId={id} />;
}