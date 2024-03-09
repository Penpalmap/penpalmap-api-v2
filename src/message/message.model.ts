import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from '../user/user.model';
import Room from '../room/room.model';

@Entity()
export default class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false,
  })
  content: string;

  @Column('boolean', {
    nullable: false,
    default: false,
  })
  isSeen: boolean;

  @ManyToOne(() => User, (user) => user.messages, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  @ManyToOne(() => Room, (room) => room.messages, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId' })
  room?: Room;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
