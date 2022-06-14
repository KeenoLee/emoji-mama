import { Knex as KnexType } from "knex";


export async function up(knex: KnexType): Promise<void> {
    const hasTable = await knex.schema.hasTable('screenshots');
    if (!hasTable) {
        await knex.schema.createTable("screenshots", (table) => {
            table.increments();
            table.text("sid");
            table.text("image");
        })
    }
}


export async function down(knex: KnexType): Promise<void> {
    await knex.schema.dropTableIfExists("screenshots");
}