export type UpdateUserDto = {
  name?: string;
  email?: string;
  gender?: string;
  birthday?: Date;
  bio?: string;
  blockedUserIds?: string[];
  languageUsed?: string;
  longitude?: number;
  latitude?: number;
  userLanguages?: {
    language: string;
    level: string;
  }[];
};
