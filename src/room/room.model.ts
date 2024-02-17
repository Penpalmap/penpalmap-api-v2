import User from "../user/user.model";
import Message from "../message/message.model";
import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export default class Room {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable({
    name: "UserRooms",
  })
  members?: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages?: Message[];
}