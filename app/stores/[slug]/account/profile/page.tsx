import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect(`/stores/${params.slug}/signin?callbackUrl=/stores/${params.slug}/account/profile`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) {
    redirect(`/stores/${params.slug}/signin`);
  }

  return (
    <ProfileForm
      email={user.email ?? ''}
      name={user.name ?? ''}
      phone={user.phone ?? ''}
      avatarUrl={user.image ?? null}
      joinedAt={user.createdAt.toISOString()}
    />
  );
}
