// import { pgTable, serial, text, boolean, timestamp, uuid, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
// import { sql } from 'drizzle-orm';

// // Course Model
// export const course = pgTable('Course', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   userId: text('userId').notNull(),
//   title: text('title').notNull(),
//   description: text('description'),
//   imageUrl: text('imageUrl'),
//   isPublished: boolean('isPublished').default(false).notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
// });

// // Category Model
// export const category = pgTable('Category', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   name: text('name').unique().notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
// });

// // CourseCategory Model (Junction Table)
// export const courseCategory = pgTable('CourseCategory', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   courseId: uuid('courseId').notNull(),
//   categoryId: uuid('categoryId').notNull(),
// }, (table) => ({
//   courseIdIdx: index('courseIdIdx').on(table.courseId),
//   categoryIdIdx: index('categoryIdIdx').on(table.categoryId),
//   courseCategoryFk1: foreignKey(() => ({ courseId: course.id })).onDelete('cascade'),
//   courseCategoryFk2: foreignKey(() => ({ categoryId: category.id })).onDelete('cascade'),
// }));

// // Attachment Model
// export const attachment = pgTable('Attachment', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   name: text('name').notNull(),
//   url: text('url').notNull(),
//   courseId: uuid('courseId').notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
// }, (table) => ({
//   courseIdIdx: index('courseIdIdx').on(table.courseId),
//   attachmentFk: foreignKey(() => ({ courseId: course.id })).onDelete('cascade'),
// }));

// // Chapter Model
// export const chapter = pgTable('Chapter', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   title: text('title').notNull(),
//   description: text('description'),
//   videoUrl: text('videoUrl'),
//   position: serial('position').notNull(),
//   isPublished: boolean('isPublished').default(false).notNull(),
//   isFree: boolean('isFree').default(false).notNull(),
//   courseId: uuid('courseId').notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
// }, (table) => ({
//   courseIdIdx: index('courseIdIdx').on(table.courseId),
//   chapterFk: foreignKey(() => ({ courseId: course.id })).onDelete('cascade'),
// }));

// // Comment Model
// export const comment = pgTable('Comment', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   content: text('content').notNull(),
//   parentId: uuid('parentId'),
//   courseId: uuid('courseId').notNull(),
//   userId: uuid('userId').notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
//   isDeleted: boolean('isDeleted').default(false).notNull(),
// }, (table) => ({
//   userIdIdx: index('userIdIdx').on(table.userId),
//   courseIdIdx: index('courseIdIdx').on(table.courseId),
//   commentFk1: foreignKey(() => ({ courseId: course.id })).onDelete('cascade'),
//   commentFk2: foreignKey(() => ({ userId: user.id })).onDelete('cascade'),
// }));

// // Like Model
// export const like = pgTable('Like', {
//   userId: uuid('userId').notNull(),
//   commentId: uuid('commentId').notNull(),
// }, (table) => ({
//   userIdIdx: index('userIdIdx').on(table.userId),
//   commentIdIdx: index('commentIdIdx').on(table.commentId),
//   likePk: primaryKey('userId', 'commentId'),
//   likeFk1: foreignKey(() => ({ userId: user.id })).onDelete('cascade'),
//   likeFk2: foreignKey(() => ({ commentId: comment.id })).onDelete('cascade'),
// }));

// // MuxData Model
// export const muxData = pgTable('MuxData', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   assetId: text('assetId').notNull(),
//   playbackId: text('playbackId'),
//   chapterId: uuid('chapterId').unique().notNull(),
// }, (table) => ({
//   muxDataFk: foreignKey(() => ({ chapterId: chapter.id })).onDelete('cascade'),
// }));

// // UserProgress Model
// export const userProgress = pgTable('UserProgress', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   userId: uuid('userId').notNull(),
//   chapterId: uuid('chapterId').notNull(),
//   isCompleted: boolean('isCompleted').default(false).notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
// }, (table) => ({
//   userProgressUnique: uniqueIndex('userProgressUnique').on(table.userId, table.chapterId),
//   chapterIdIdx: index('chapterIdIdx').on(table.chapterId),
//   userProgressFk: foreignKey(() => ({ chapterId: chapter.id })).onDelete('cascade'),
// }));

// // Enroll Model
// export const enroll = pgTable('Enroll', {
//   id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
//   userId: uuid('userId').notNull(),
//   courseId: uuid('courseId').notNull(),
//   createdAt: timestamp('createdAt').defaultNow().notNull(),
//   updatedAt: timestamp('updatedAt').defaultNow().notNull(),
//   isAccepted: boolean('isAccepted').default(false).notNull(),
// }, (table) => ({
//   enrollUnique: uniqueIndex('enrollUnique').on(table.userId, table.courseId),
//   courseIdIdx: index('courseIdIdx').on(table.courseId),
//   enrollFk1: foreignKey(() => ({ courseId: course.id })).onDelete('cascade'),
//   enrollFk2: foreignKey(() => ({ userId: user.id })).onDelete('cascade'),
// }));

// // Account Model
// export const account = pgTable('Account', {
//   id: uuid('id').default(sql`cuid_generate()`).primaryKey(),
//   userId: uuid('userId').notNull(),
//   type: text('type').notNull(),
//   provider: text('provider').notNull(),
//   providerAccountId: text('providerAccountId').notNull(),
//   refresh_token: text('refresh_token'),
//   access_token: text('access_token'),
//   expires_at: serial('expires_at'),
//   token_type: text('token_type'),
//   scope: text('scope'),
//   id_token: text('id_token'),
//   session_state: text('session_state'),
// }, (table) => ({
//   accountUnique: uniqueIndex('accountUnique').on(table.provider, table.providerAccountId),
//   userIdIdx: index('userIdIdx').on(table.userId),
//   accountFk: foreignKey(() => ({ userId: user.id })).onDelete('cascade'),
// }));

// // Session Model
// export const session = pgTable('Session', {
//   id: uuid('id').default(sql`cuid_generate()`).primaryKey(),
//   sessionToken: text('sessionToken').unique().notNull(),
//   userId: uuid('userId').notNull(),
//   expires: timestamp('expires').notNull(),
// }, (table) => ({
//   userIdIdx: index('userIdIdx').on(table.userId),
//   sessionFk: foreignKey(() => ({ userId: user.id })).onDelete('cascade'),
// }));

// // User Model
// export const user = pgTable('User', {
//   id: uuid('id').default(sql`cuid_generate()`).primaryKey(),
//   name: text('name'),
//   username: text('username').unique(),
//   phone: text('phone').unique(),
//   email: text('email').unique().notNull(),
//   password: text('password'),
//   emailVerified: timestamp('emailVerified'),
//   image: text('image'),
//   role: text('role'),
// });

// // VerificationToken Model
// export const verificationToken = pgTable('VerificationToken', {
//   identifier: text('identifier').notNull(),
//   token: text('token').unique().notNull(),
//   expires: timestamp('expires').notNull(),
// }, (table) => ({
//   verificationTokenUnique: uniqueIndex('verificationTokenUnique').on(table.identifier, table.token),
// }));
