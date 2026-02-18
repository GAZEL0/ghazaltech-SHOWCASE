import { BlogAdminClient } from "./BlogAdminClient";

export default async function AdminBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BlogAdminClient locale={locale} />;
}
