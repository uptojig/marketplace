export interface IdentityName {
  prefix?: string;
  first?: string;
  middle?: string;
  last?: string;
  full?: string;
}

export interface IdentityAddress {
  full?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postal?: string;
}

export interface BankAccountIdentity {
  holder?: string;
  number?: string;
  bank?: string;
  branch?: string;
}

export interface Identity {
  citizenId?: string;
  /**
   * Raw citizen-ID as the source rendered it (e.g. DGA shows "1-1017-00119-59-9"
   * with dashes). `citizenId` keeps the digits-only form for cross-match;
   * `citizenIdFormatted` is preserved for UI display of "as captured".
   */
  citizenIdFormatted?: string;
  thName?: IdentityName;
  enName?: IdentityName;
  dob?: string;
  /**
   * Raw date-of-birth as the source rendered it (e.g. DGA shows
   * "12 สิงหาคม 2535" in Thai BE). `dob` keeps the ISO YYYY-MM-DD CE form
   * for cross-match; `dobRaw` is preserved for UI display of "as captured".
   */
  dobRaw?: string;
  address?: IdentityAddress;
  contactAddress?: IdentityAddress;
  phoneLast4?: string;
  phone?: string;
  mobilePhone?: string;
  email?: string;
  username?: string;
  userType?: string;
  authMethod?: string;
  ialLevels?: string[];
  bankAccount?: BankAccountIdentity;
}

export interface IdentityMatchResult {
  matchType: string;
  leftSource: string;
  rightSource: string;
  leftValue?: string;
  rightValue?: string;
  score?: number;
  threshold?: number;
  matched: boolean;
  reason?: string;
}
