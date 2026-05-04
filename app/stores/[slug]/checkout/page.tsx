import { redirect } from "next/navigation";

// /stores/[slug]/checkout → redirect to first checkout step inside
// the same store namespace. Previously redirected to /checkout/address
// (marketplace root) which left the store theme.
export default function CheckoutIndex({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/stores/${params.slug}/checkout/address`);
}
