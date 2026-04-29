interface StoreSocialFields {
  facebookUrl?: string | null;
  messengerUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  lineId?: string | null;
}

interface StoreContactFields {
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export function StoreSocialIcons({ store }: { store: StoreSocialFields }) {
  // TODO: recover full content from Vercel deployment 7295d69
  return null;
}

export function StoreContactRows({ store }: { store: StoreContactFields }) {
  // TODO: recover full content from Vercel deployment 7295d69
  return null;
}
