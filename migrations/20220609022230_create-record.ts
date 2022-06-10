import { Knex as KnexType } from "knex";


export async function up(knex: KnexType): Promise<void> {
    const hasTable = await knex.schema.hasTable('record');
    if (!hasTable) {
        await knex.schema.createTable("record", (table) => {
            table.increments();
            table.string("name");
            table.integer("score");
        })
    }
}


export async function down(knex: KnexType): Promise<void> {
    await knex.schema.dropTableIfExists("record");
}

g