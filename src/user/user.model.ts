import {
  Model,
  Table,
  Column,
  DataType,
  PrimaryKey,
  HasMany,
  BelongsToMany,
  DefaultScope,
  Scopes,
  Unique,
} from "sequelize-typescript";
import UserImage from "./user-image.model";
import Room from "../room/room.model";
import UserRoom from "../room/user-room.model";
import Message from "../message/message.model";
import UserLanguage from "./user-language.model";
import Sequelize from "sequelize/types/sequelize";
import ResetPassword from "../auth/reset-password.model";
import RefreshTokens from "../auth/refresh-tokens.model";

@DefaultScope(() => ({
  attributes: { exclude: ["password"] },
}))
@Scopes(() => ({
  withPassword: {
    include: {
      all: true, // ou spécifiez les attributs individuellement
    },
  },
}))
@Table
export default class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,

    allowNull: true,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare googleId: string;

  @Column({
    type: DataType.GEOMETRY("POINT", 4326),
    allowNull: true,
  })
  declare geom: Sequelize["literal"];

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: 0,
  })
  declare points: number;

  // TODO: rename this field to mapImage
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string | undefined | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gender: string | undefined;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  birthday: Date | undefined;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  bio: string | undefined;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isNewUser: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare connections: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare languageUsed: string;

  @Column({
    allowNull: true,
    defaultValue: () => Math.floor(Math.random() * 24) + 1,
  })
  declare avatarNumber: number;

  // TODO: rename this field to profileImages
  @HasMany(() => UserImage)
  userImages!: UserImage[];

  @BelongsToMany(() => Room, () => UserRoom)
  rooms!: Room[];

  @HasMany(() => Message)
  messages!: Message[];

  @HasMany(() => UserLanguage)
  userLanguages!: UserLanguage[];

  @HasMany(() => ResetPassword)
  resetPasswords!: ResetPassword[];

  @HasMany(() => RefreshTokens)
  refreshTokens!: RefreshTokens[];
}
