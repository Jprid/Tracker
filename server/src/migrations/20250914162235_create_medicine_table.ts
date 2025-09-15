import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("medicine", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.decimal("dose", 10, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Only insert entries that don't already exist in medicine
  const hasHabitEntriesTable = await knex.schema.hasTable("habit_entries");
  if (hasHabitEntriesTable) {
    await knex.raw(`
        INSERT INTO medicine (name, dose, created_at)
        SELECT he.habit_name, he.dose, he.created_at
        FROM habit_entries he
        WHERE NOT EXISTS (
            SELECT 1 FROM medicine m 
            WHERE m.name = he.habit_name 
              and m.dose = he.dose 
              and m.created_at = he.created_at
        )
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("medicine");
}
