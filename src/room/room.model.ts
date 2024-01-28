import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import User from "../user/user.model";
import UserRoom from "./user-room.model";
import Message from "../message/message.model";

@Table
export default class Room extends Model<Room> {
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
