import { Point } from 'typeorm';
import { UserImageDto } from './user-image.dto';
import { UserLanguageDto } from './user-language.dto';
import { RoleDto } from '../../role/dto/role.dto';

export class UserDto {
  id: string;
  blockedUsers?: UserDto[];
  name: string;
  email: string;
  googleId?: string;
  geom?: Point;
  points: number;
  image?: string;
  gender?: string;
  birthday?: Date;
  bio?: string;
  isNewUser: boolean;
  connections: number;
  languageUsed?: string;
  avatarNumber?: number;
  userImages?: UserImageDto[];
  userLanguages?: UserLanguageDto[];
  isOnline: boolean;
  updatedAt: Date;
  roles?: RoleDto[];
}
