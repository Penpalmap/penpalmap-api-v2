export type CreateUserDto = {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  userLanguages?: {
    language: string;
    level: string;
  }[];
};
