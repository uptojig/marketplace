// Server component — pulls the signed-in user's profile from Prisma
// and hands it to the client form for editing.

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/account/queries";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();
  if (!user) {
    redirect("/signin?callbackUrl=/account/profile");
  }
  return <ProfileForm user={user} />;
}
