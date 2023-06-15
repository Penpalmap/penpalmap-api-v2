import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "./User";
import { Room } from "./Room";

@Table
export class Message extends Model<Message> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isSeen!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  senderId!: string;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  roomId!: string;

  @BelongsTo(() => Room)
  room!: Room;

  @BelongsTo(() => User)
  sender!: User;
}
