import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('habit_entries', (table) => {
        table.increments('id').primary();
        table.integer('day_id').notNullable().references('id').inTable('days').onDelete('CASCADE');
        table.string('habit_name').notNullable();
        table.boolean('completed').notNullable().defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('habit_entries');
}