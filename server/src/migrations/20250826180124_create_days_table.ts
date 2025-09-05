import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('days', (table) => {
        table.increments('id').primary();
        table.string('date').notNullable().unique(); // e.g., '2025-08-24'
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('days');
}