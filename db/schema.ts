import {
    pgTable,
    uuid,
    varchar,
    timestamp
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    name: varchar("name", { length: 255 }).notNull(),

    email: varchar("email", { length: 255 })
        .unique()
        .notNull(),

    password: varchar("password", { length: 255 }).notNull(),

    createdAt: timestamp("created_at").defaultNow()
});