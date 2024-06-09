import { ConnectedUser } from 'src/modules/chat/entities/connected-user.entity';
import { Message } from 'src/modules/chat/entities/message.entity';
import { Room } from 'src/modules/chat/entities/room.entity';
import { BaseEntity } from 'src/utils/entities/base.entity';
import { Column, Entity, ManyToMany, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'user' })
@Unique(['email'])
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  hashedPassword: string;

  @Column({ nullable: true })
  refreshToken: string;

  // Relations
  @ManyToMany(() => Room, (room) => room.participants)
  rooms: Room[];

  @OneToMany(() => ConnectedUser, (connectedUser) => connectedUser)
  connectedUsers: ConnectedUser[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
