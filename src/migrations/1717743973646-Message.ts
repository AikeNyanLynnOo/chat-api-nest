import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Message1717743973646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'message',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'roomId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'text',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'updatedBy',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'DATETIME',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'DATETIME',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'message',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'room',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'message',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'message',
      new TableForeignKey({
        columnNames: ['updatedBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const message = await queryRunner.getTable('message');
    // drop foreign keys first for clarity
    const existRoomIdFK = message.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('roomId') !== -1,
    );
    if (existRoomIdFK) {
      await queryRunner.dropForeignKey('message', existRoomIdFK);
    }
    const existCreatedByFK = message.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('createdBy') !== -1,
    );
    if (existCreatedByFK) {
      await queryRunner.dropForeignKey('message', existCreatedByFK);
    }
    const existUpdatedByFK = message.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('updatedBy') !== -1,
    );
    if (existUpdatedByFK) {
      await queryRunner.dropForeignKey('message', existUpdatedByFK);
    }

    // drop table then
    await queryRunner.dropTable('message', true);
  }
}
