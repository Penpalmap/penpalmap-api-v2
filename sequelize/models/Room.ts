import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "./User";
import { UserRoom } from "./UserRoom";
import { Message } from "./Message";

@Table
export class Room extends Model<Room> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @BelongsToMany(() => User, () => UserRoom)
  members!: User[];

  @HasMany(() => Message)
  messages!: Message[];
}
