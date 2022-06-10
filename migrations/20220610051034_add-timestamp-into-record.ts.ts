import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.alterTable('record', table => {
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('record', table => {
        table.dropColumn('created_at')
    })
}

