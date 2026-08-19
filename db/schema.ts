import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const clients = sqliteTable(
  "clients",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    age: integer("age"),
    gender: text("gender", { enum: ["male", "female"] }),
    heightCm: real("height_cm"),
    currentWeightKg: real("current_weight_kg"),
    phone: text("phone"),
    startDate: text("start_date"),
    goal: text("goal"),
    generalNotes: text("general_notes"),
    photoUri: text("photo_uri"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [index("clients_updated_at_idx").on(t.updatedAt)]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    notes: text("notes"),
    templateName: text("template_name"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [
    index("sessions_client_date_idx").on(t.clientId, t.date),
    index("sessions_updated_at_idx").on(t.updatedAt),
  ]
);

export const sessionExercises = sqliteTable(
  "session_exercises",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    orderIndex: integer("order_index").notNull().default(0),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [
    index("session_exercises_session_idx").on(t.sessionId, t.orderIndex),
    index("session_exercises_updated_at_idx").on(t.updatedAt),
  ]
);

export const sets = sqliteTable(
  "sets",
  {
    id: text("id").primaryKey(),
    sessionExerciseId: text("session_exercise_id")
      .notNull()
      .references(() => sessionExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    weight: real("weight").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    intensity: text("intensity"),
    notes: text("notes"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [
    index("sets_session_exercise_idx").on(t.sessionExerciseId, t.setNumber),
    index("sets_updated_at_idx").on(t.updatedAt),
  ]
);

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    muscleGroup: text("muscle_group"),
    notes: text("notes"),
    videoLink: text("video_link"),
    isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [index("exercises_updated_at_idx").on(t.updatedAt)]
);

export const assessments = sqliteTable(
  "assessments",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "body",
        "movement",
        "cardio",
        "strength",
        "mobility",
        "balance",
        "custom",
      ],
    }).notNull(),
    customTypeName: text("custom_type_name"),
    date: text("date").notNull(),
    generalNotes: text("general_notes"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [
    index("assessments_client_date_idx").on(t.clientId, t.date),
    index("assessments_updated_at_idx").on(t.updatedAt),
  ]
);

export const assessmentTests = sqliteTable(
  "assessment_tests",
  {
    id: text("id").primaryKey(),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    testName: text("test_name").notNull(),
    fields: text("fields", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    result: text("result"),
    notes: text("notes"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [
    index("assessment_tests_assessment_idx").on(t.assessmentId),
    index("assessment_tests_updated_at_idx").on(t.updatedAt),
  ]
);

export const clientPhotos = sqliteTable(
  "client_photos",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id").references(() => assessments.id),
    angle: text("angle", { enum: ["front", "side", "back"] }).notNull(),
    uri: text("uri").notNull(),
    date: text("date").notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    syncedAt: text("synced_at"),
  },
  (t) => [
    index("client_photos_client_date_idx").on(t.clientId, t.date),
    index("client_photos_updated_at_idx").on(t.updatedAt),
  ]
);

export const clientsRelations = relations(clients, ({ many }) => ({
  sessions: many(sessions),
  assessments: many(assessments),
  photos: many(clientPhotos),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  client: one(clients, { fields: [sessions.clientId], references: [clients.id] }),
  exercises: many(sessionExercises),
}));

export const sessionExercisesRelations = relations(
  sessionExercises,
  ({ one, many }) => ({
    session: one(sessions, {
      fields: [sessionExercises.sessionId],
      references: [sessions.id],
    }),
    exercise: one(exercises, {
      fields: [sessionExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [sets.sessionExerciseId],
    references: [sessionExercises.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  client: one(clients, {
    fields: [assessments.clientId],
    references: [clients.id],
  }),
  tests: many(assessmentTests),
  photos: many(clientPhotos),
}));

export const assessmentTestsRelations = relations(assessmentTests, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentTests.assessmentId],
    references: [assessments.id],
  }),
}));

export const clientPhotosRelations = relations(clientPhotos, ({ one }) => ({
  client: one(clients, {
    fields: [clientPhotos.clientId],
    references: [clients.id],
  }),
  assessment: one(assessments, {
    fields: [clientPhotos.assessmentId],
    references: [assessments.id],
  }),
}));
