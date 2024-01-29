import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import User from "./user.model";

@Table
export default class UserLanguage extends Model<UserLanguage> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare language: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare level: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  user!: User;
}
