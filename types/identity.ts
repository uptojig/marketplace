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
  thName?: IdentityName;
  enName?: IdentityName;
  dob?: string;
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
