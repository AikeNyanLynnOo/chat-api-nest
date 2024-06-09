import { User } from 'src/modules/user/entities';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Room } from './room.entity';
import { BaseEntity } from 'src/utils/entities/base.entity';

@Entity({
  name: 'message',
})
export class Message extends BaseEntity {
  @Column()
  text: string;

  @Column()
  roomId: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  // Relations

  // Join Message => User many to one, referenced by id, Fk createdBy
  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn([{ name: 'createdBy', referencedColumnName: 'id' }])
  user: User;

  // Join Message => Room many to one, referenced by id, Fk roomId
  @ManyToOne(() => Room, (room) => room.messages)
  @JoinColumn([{ name: 'roomId', referencedColumnName: 'id' }])
  room: Room;
}
