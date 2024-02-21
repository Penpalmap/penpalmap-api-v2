export type UpdateUserDto = {
  bio?: string;
  blockedUserIds?: string[];
  birthday?: Date;
  gender?: string;
  languageUsed?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  isNewUser?: boolean;
  userLanguages?: {
    language: string;
    level: string;
  }[];
};
