import { redirect } from "next/navigation";
export default function ProductsRedirect({ params }: { params: { slug: string } }) {
  redirect(`/stores/${params.slug}/category`);
}
