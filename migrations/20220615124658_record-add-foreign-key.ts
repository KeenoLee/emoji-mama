import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('screenshots', table => {
        table.integer('record_id')
            .unsigned()
            .index()
            .references('id')
            .inTable('record');
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('record', table => {
        table.dropColumn('record_id');
    })
}

