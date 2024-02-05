import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import User from './user.model';

@Table
export default class UserBlock extends Model<UserBlock> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare blockerUserId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare blockedUserId: string;

  @BelongsTo(() => User, 'blockerUserId')
  blockerUser!: User;

  @BelongsTo(() => User, 'blockedUserId')
  blockedUser!: User;
}
