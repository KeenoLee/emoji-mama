import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('screenshots', table => {
        table.string("icon");
    })

}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('screenshots', table => {
        table.dropColumn('icon');
    })
}

