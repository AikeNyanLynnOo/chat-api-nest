import { User } from 'src/modules/user/entities';
import { BaseEntity } from 'src/utils/entities/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity({
  name: 'room',
})
export class Room extends BaseEntity {
  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  // Relations

  // Join Room <=> User with a junction table name "roomParticipantUser"
  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable({
    name: 'roomParticipantUser',
    joinColumn: {
      name: 'roomId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  participants: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
