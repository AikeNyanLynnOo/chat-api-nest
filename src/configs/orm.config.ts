import { DataSource } from 'typeorm';
import { resolve } from 'path';

export const Source = new DataSource({
  type: 'sqlite',
  database: resolve('db/chatapp.db'),
  entities: [resolve('dist/**/*.entity.js')],
  migrations: [resolve('dist/migrations/*.js')],
  synchronize: false,
  logging: true,
  migrationsRun: true,
});

Source.initialize()
  .then(() => {
    console.log('Data Source initialized successfully!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
