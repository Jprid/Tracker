import type {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('entries', (table) => {
            table.increments('id').primary();
            table.timestamp('completed_at').nullable().defaultTo(null);
            table.text('text').notNullable();
            table.boolean('completed').notNullable().defaultTo(false);
            table.timestamp('created_at').defaultTo(knex.fn.now());
        }
    )
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('entries');
}
