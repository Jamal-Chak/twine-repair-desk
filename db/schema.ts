import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const enquiries=sqliteTable('enquiries',{
 id:text('id').primaryKey(), name:text('name').notNull(),phone:text('phone').notNull(),email:text('email').notNull(),area:text('area').notNull(),service:text('service').notNull(),description:text('description').notNull(),status:text('status').notNull().default('New'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),contactedAt:text('contacted_at'),closedAt:text('closed_at'),version:integer('version').notNull().default(1)
},t=>[index('enquiries_created_idx').on(t.createdAt)]);
export const events=sqliteTable('events',{id:text('id').primaryKey(),enquiryId:text('enquiry_id').notNull().references(()=>enquiries.id,{onDelete:'cascade'}),actor:text('actor').notNull(),action:text('action').notNull(),note:text('note'),createdAt:text('created_at').notNull()},t=>[index('events_enquiry_idx').on(t.enquiryId)]);
export const staff=sqliteTable('staff',{role:text('role').primaryKey(),userId:text('user_id').notNull().unique(),createdAt:text('created_at').notNull()});
export const limits=sqliteTable('rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});
