import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "../user/user.model";

@Entity()
export default class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column("varchar", {
    nullable: false,
    unique: true,
  })
  token: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user?: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
