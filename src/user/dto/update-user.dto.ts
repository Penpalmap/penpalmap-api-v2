export class UpdateUserDto {
  bio?: string;
  blockedUserIds?: string[];
  birthday?: Date;
  gender?: string;
  languageUsed?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  userLanguages?: {
    language: string;
    level: string;
  }[];
}
