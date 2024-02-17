import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./user.model";

@Entity()
export default class UserLanguage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", {
    nullable: false,
  })
  language: string;

  @Column("varchar", {
    nullable: false,
  })
  level: string;

  @ManyToOne(() => User, (user) => user.userLanguages, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @CreateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
