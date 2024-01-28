import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
} from "sequelize-typescript";
import User from "../user/user.model";

@Table
export default class RefreshTokens extends Model<RefreshTokens> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare token: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: number;
}
