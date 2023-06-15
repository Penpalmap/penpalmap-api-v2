import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./User";

@Table
export class UserImages extends Model<UserImages> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare src: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare position: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  user!: User;
}
