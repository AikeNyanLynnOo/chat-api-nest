import { User } from 'src/modules/user/entities';
import { BaseEntity } from 'src/utils/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({
  name: 'connectedUser',
})
export class ConnectedUser extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  socketId: string;

  // relations
  @ManyToOne(() => User, (user) => user.connectedUsers)
  @JoinColumn([
    {
      name: 'userId',
      referencedColumnName: 'id',
    },
  ])
  user: User;
}
