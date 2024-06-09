import { BaseEntity } from 'src/utils/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'roomParticipant',
})
export class RoomParticipant extends BaseEntity {
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
