import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentFor } from "@/lib/documents";
import { DocumentWorkspace } from "@/components/document-workspace";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const document = await getDocumentFor((await params).id, user.id);
  if (!document) notFound();

  return <DocumentWorkspace user={user} document={document} />;
}
