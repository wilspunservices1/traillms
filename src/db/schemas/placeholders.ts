import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  foreignKey,
  decimal,
} from "drizzle-orm/pg-core";
import { certification } from "./certification"; // Ensure correct import of certifications table

export const placeholders = pgTable(
  "placeholders",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    certificate_id: uuid("certificate_id")
      .references(() => certification.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    key: text("key").notNull(),
    discount: integer("discount").default(0),
    x: decimal("x", { precision: 10, scale: 2 }).default("0").notNull(),
    y: decimal("y", { precision: 10, scale: 2 }).default("0").notNull(),
    font_size: decimal("font_size").default("12").notNull(),
    is_visible: boolean("is_visible").default(true).notNull(),
    label: text("label").default("PlaceHolderLabel").notNull(),
    color: text("color").default("#000000").notNull(),
    value: text("value").default("PlaceHolderValue").notNull(),
  },
  (table) => {
    return {
      // ✅ Foreign Key: certificateId → certifications.id
      placeholderCertificateFk: foreignKey({
        columns: [table.certificate_id],
        foreignColumns: [certification.id],
        name: "placeholders_certificate_id_certifications_id_fk",
      }),
    };
  }
);
