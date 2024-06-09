import { BaseEntity } from 'src/utils/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'roomParticipantUser',
})
export class RoomParticipantUser extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  roomId: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  // Relations
}
