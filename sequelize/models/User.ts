import {
  Model,
  Table,
  Column,
  DataType,
  PrimaryKey,
  HasMany,
  BelongsTo,
  BelongsToMany,
  HasOne,
  DefaultScope,
  Scopes,
  Unique,
} from "sequelize-typescript";
import { UserImages } from "./UserImages";
import { Room } from "./Room";
import { UserRoom } from "./UserRoom";
import { Message } from "./Message";

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
export class User extends Model<User> {
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
    type: DataType.REAL,
    allowNull: true,
  })
  declare longitude: number;

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  declare latitude: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: 0,
  })
  declare points: number;

  // Next auth model
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image: string;

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

  @HasMany(() => UserImages)
  userImages!: UserImages[];

  @BelongsToMany(() => Room, () => UserRoom)
  rooms!: Room[];

  @HasMany(() => Message)
  messages!: Message[];
}
