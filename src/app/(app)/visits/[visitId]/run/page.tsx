import { RunClient } from "@/components/runtime/RunClient";

export default async function RunVisitPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  return <RunClient visitId={visitId} />;
}
