import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/* =========================================================
   ENUMS
========================================================= */

export const walletTypeEnum = pgEnum('wallet_type', [
  'bank',
  'cash',
  'credit_card',
  'digital_account',
  'investment',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
  'transfer',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'pix',
  'credit_card',
  'debit_card',
  'bank_transfer',
  'boleto',
]);

export const frequencyTypeEnum = pgEnum('frequency_type', [
  'one_time',
  'installment',
  'recurring',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'paid',
  'overdue',
  'canceled',
]);

/* =========================================================
   USERS
========================================================= */

export const usersTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),

    name: text('name').notNull(),

    email: text('email').notNull().unique(),

    emailVerified: boolean('email_verified').notNull(),

    image: text('image'),

    stripeCustomerId: text('stripe_customer_id'),

    stripeSubscriptionId: text('stripe_subscription_id'),

    plan: text('plan'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  }),
);

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  wallets: many(walletsTable),

  categories: many(categoriesTable),

  transactions: many(transactionsTable),
}));

/* =========================================================
   WALLETS
========================================================= */

export const walletsTable = pgTable(
  'wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    name: text('name').notNull(),

    type: walletTypeEnum('type').notNull(),

    initialBalanceInCents: integer('initial_balance_in_cents')
      .default(0)
      .notNull(),

    color: text('color'),

    icon: text('icon'),

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('wallets_user_id_idx').on(table.userId),

    typeIdx: index('wallets_type_idx').on(table.type),

    activeIdx: index('wallets_active_idx').on(table.isActive),
  }),
);

export const walletsTableRelations = relations(
  walletsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [walletsTable.userId],
      references: [usersTable.id],
    }),

    transactions: many(transactionsTable),
  }),
);

/* =========================================================
   CATEGORIES
========================================================= */

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    name: text('name').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('categories_user_id_idx').on(table.userId),

    userNameUniqueIdx: uniqueIndex('categories_user_name_unique_idx').on(
      table.userId,
      table.name,
    ),
  }),
);

export const categoriesTableRelations = relations(
  categoriesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [categoriesTable.userId],
      references: [usersTable.id],
    }),

    transactions: many(transactionsTable),
  }),
);

/* =========================================================
   TRANSACTIONS
========================================================= */

export const transactionsTable = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    walletId: uuid('wallet_id')
      .notNull()
      .references(() => walletsTable.id, {
        onDelete: 'cascade',
      }),

    categoryId: uuid('category_id').references(() => categoriesTable.id, {
      onDelete: 'set null',
    }),

    title: text('title').notNull(),

    description: text('description'),

    transactionType: transactionTypeEnum('transaction_type').notNull(),

    paymentMethod: paymentMethodEnum('payment_method').notNull(),

    frequencyType: frequencyTypeEnum('frequency_type')
      .default('one_time')
      .notNull(),

    amountTotalInCents: integer('amount_total_in_cents').notNull(),

    installments: integer('installments').default(1).notNull(),

    startDate: timestamp('start_date').notNull(),

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('transactions_user_id_idx').on(table.userId),

    walletIdIdx: index('transactions_wallet_id_idx').on(table.walletId),

    categoryIdIdx: index('transactions_category_id_idx').on(table.categoryId),

    transactionTypeIdx: index('transactions_transaction_type_idx').on(
      table.transactionType,
    ),

    paymentMethodIdx: index('transactions_payment_method_idx').on(
      table.paymentMethod,
    ),

    frequencyTypeIdx: index('transactions_frequency_type_idx').on(
      table.frequencyType,
    ),

    startDateIdx: index('transactions_start_date_idx').on(table.startDate),

    activeIdx: index('transactions_active_idx').on(table.isActive),
  }),
);

export const transactionsTableRelations = relations(
  transactionsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [transactionsTable.userId],
      references: [usersTable.id],
    }),

    wallet: one(walletsTable, {
      fields: [transactionsTable.walletId],
      references: [walletsTable.id],
    }),

    category: one(categoriesTable, {
      fields: [transactionsTable.categoryId],
      references: [categoriesTable.id],
    }),

    occurrences: many(transactionOccurrencesTable),
  }),
);

/* =========================================================
   TRANSACTION OCCURRENCES
========================================================= */

export const transactionOccurrencesTable = pgTable(
  'transaction_occurrences',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    transactionId: uuid('transaction_id')
      .notNull()
      .references(() => transactionsTable.id, {
        onDelete: 'cascade',
      }),

    occurrenceDate: timestamp('occurrence_date').notNull(),

    dueDate: timestamp('due_date').notNull(),

    amountInCents: integer('amount_in_cents').notNull(),

    installmentNumber: integer('installment_number'),

    installmentTotal: integer('installment_total'),

    status: transactionStatusEnum('status').default('pending').notNull(),

    paidAt: timestamp('paid_at'),

    notes: text('notes'),

    isDeleted: boolean('is_deleted').default(false).notNull(),

    deletedAt: timestamp('deleted_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    transactionIdIdx: index('transaction_occurrences_transaction_id_idx').on(
      table.transactionId,
    ),

    dueDateIdx: index('transaction_occurrences_due_date_idx').on(table.dueDate),

    occurrenceDateIdx: index('transaction_occurrences_occurrence_date_idx').on(
      table.occurrenceDate,
    ),

    statusIdx: index('transaction_occurrences_status_idx').on(table.status),

    paidAtIdx: index('transaction_occurrences_paid_at_idx').on(table.paidAt),

    deletedIdx: index('transaction_occurrences_deleted_idx').on(
      table.isDeleted,
    ),
  }),
);

export const transactionOccurrencesTableRelations = relations(
  transactionOccurrencesTable,
  ({ one }) => ({
    transaction: one(transactionsTable, {
      fields: [transactionOccurrencesTable.transactionId],
      references: [transactionsTable.id],
    }),
  }),
);

/* =========================================================
   BETTER AUTH TABLES
========================================================= */

export const sessionsTable = pgTable(
  'session',
  {
    id: text('id').primaryKey(),

    expiresAt: timestamp('expires_at').notNull(),

    token: text('token').notNull().unique(),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),

    ipAddress: text('ip_address'),

    userAgent: text('user_agent'),

    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    tokenIdx: uniqueIndex('sessions_token_idx').on(table.token),

    userIdIdx: index('sessions_user_id_idx').on(table.userId),
  }),
);

export const accountsTable = pgTable(
  'account',
  {
    id: text('id').primaryKey(),

    accountId: text('account_id').notNull(),

    providerId: text('provider_id').notNull(),

    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    accessToken: text('access_token'),

    refreshToken: text('refresh_token'),

    idToken: text('id_token'),

    accessTokenExpiresAt: timestamp('access_token_expires_at'),

    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),

    scope: text('scope'),

    password: text('password'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('accounts_user_id_idx').on(table.userId),

    providerIdx: index('accounts_provider_id_idx').on(table.providerId),
  }),
);

export const verificationsTable = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),

    identifier: text('identifier').notNull(),

    value: text('value').notNull(),

    expiresAt: timestamp('expires_at').notNull(),

    createdAt: timestamp('created_at').defaultNow(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
  }),
);
