import { knex } from './app';

describe('migration test', () => {
    it('should finish migration', async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
    });

    it('should run seed', async () => {
        await knex.seed.run();
    });
});