CREATE TABLE IF NOT EXISTS profiles(
    id UUID PRIMARY KEY,
    name varchar(255) not null,
    email varchar(255) unique not null,

);

CREATE TABLE IF NOT EXISTS currencies(
    id UUID PRIMARY KEY,
    ticker varchar(16),
    name varchar(64)
);

CREATE TABLE IF NOT EXISTS accounts(
    id UUID PRIMARY KEY,
    profile_id UUID references profiles(id) NOT NULL,
    balance double precision NOT NULL default 0.0,
    currency_id uuid references currencies(id) NOT NULL,
    is_active boolean not null default true,
    created_at timestamp not null,
    updated_at timestamp not null
);

create type transaction_status as enum('NEW', 'APPROVED', 'FINISHED', 'FAILED');
create type transaction_purpose as enum('DEPOSIT', 'WITHDRAW', 'INNER_TRANSFER', 'EXTERNAL_TRANSFER');

CREATE TABLE IF NOT EXISTS transactions(
    id UUID PRIMARY KEY,
    source_account_id UUID references accounts(id),
    destination_account_id UUID references accounts(id),
    purpose transaction_purpose not null,
    amount double precision not null,
    currency_id uuid references currencies(id) NOT NULL,
    fail_reason varchar(1024) default null,
    status transaction_status not null DEFAULT 'NEW'::transaction_status,
    created_at timestamp not null,
    updated_at timestamp not null
);