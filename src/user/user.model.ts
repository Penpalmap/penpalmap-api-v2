import UserImage from './user-image.model';
import Room from '../room/room.model';
import Message from '../message/message.model';
import UserLanguage from './user-language.model';
import ResetPassword from '../auth/reset-password.model';
import RefreshTokens from '../auth/refresh-token.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Role from '../role/role.model';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false,
  })
  name: string;

  @Column('varchar', {
    nullable: false,
    unique: true,
  })
  email: string;

  @Column('varchar', {
    nullable: true,
  })
  password?: string;

  @Column('varchar', {
    nullable: true,
  })
  googleId?: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geom?: Point;

  @Column('int8', {
    nullable: false,
    default: 0,
  })
  points: number;

  @Column('varchar', {
    nullable: true,
  })
  image?: string;

  @Column('varchar', {
    nullable: true,
  })
  gender?: string;

  @Column('timestamptz', {
    nullable: true,
  })
  birthday?: Date;

  @Column('varchar', {
    nullable: true,
  })
  bio?: string;

  @Column('boolean', {
    nullable: false,
    default: true,
  })
  isNewUser: boolean;

  @Column('int4', {
    nullable: false,
    default: 0,
  })
  connections: number;

  @Column('varchar', {
    nullable: true,
  })
  languageUsed?: string;

  @Column('int4', {
    nullable: true,
    default: () => `floor(random() * 26 + 1)`,
  })
  avatarNumber?: number;

  @OneToMany(() => UserImage, (userImage) => userImage.user, {
    cascade: true,
    eager: true,
  })
  userImages?: UserImage[];

  @ManyToMany(() => User, (user) => user.blockedUsers)
  @JoinTable()
  blockedUsers?: User[];

  @ManyToMany(() => Room, (room) => room.members, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  rooms?: Room[];

  @OneToMany(() => Message, (message) => message.sender)
  messages?: Message[];

  @OneToMany(() => UserLanguage, (userLanguage) => userLanguage.user, {
    cascade: true,
    eager: true,
  })
  userLanguages?: UserLanguage[];

  @OneToMany(() => ResetPassword, (resetPassword) => resetPassword.user)
  resetPasswords?: ResetPassword[];

  @OneToMany(() => RefreshTokens, (refreshTokens) => refreshTokens.user)
  refreshTokens?: RefreshTokens[];

  @ManyToMany(() => Role, (role) => role.users)
  roles?: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
