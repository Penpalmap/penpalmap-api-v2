export class CreateUserDto {
  bio?: string;
  birthday?: Date;
  email: string;
  gender?: string;
  googleId?: string;
  languageUsed?: string;
  name: string;
  password?: string;
  userLanguages?: {
    language: string;
    level: string;
  }[];
}
