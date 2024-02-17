import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./user.model";

@Entity()
export default class UserImage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", {
    nullable: false,
  })
  src: string;

  @Column("int4", {
    nullable: false,
  })
  position: number;

  @ManyToOne(() => User, (user) => user.userImages, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
