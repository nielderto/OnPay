CREATE TABLE IF NOT EXISTS ens_records (
    name TEXT UNIQUE NOT NULL, 
    address TEXT, 
    avatar TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX index_name ON ens_records(name);