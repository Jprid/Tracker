import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("entries", (table) => {
    table.index(["created_at"], "entries_created_at_idx");
  });
  await knex.schema.alterTable("medicine", (table) => {
    table.index(["created_at"], "medicine_created_at_idx");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("entries", (table) => {
    table.dropIndex(["created_at"], "entries_created_at_idx");
  });
  await knex.schema.alterTable("medicine", (table) => {
    table.dropIndex(["created_at"], "medicine_created_at_idx");
  });
}
