CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',

    started_at TIMESTAMPTZ DEFAULT NOW(),   
    ended_at TIMESTAMPTZ NULL,              
    created_at TIMESTAMPTZ DEFAULT NOW()    
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,

    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,

    recorded_at TIMESTAMPTZ NOT NULL,       
    created_at TIMESTAMPTZ DEFAULT NOW(),   

    UNIQUE(session_id, recorded_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_device ON sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_locations_session_time ON locations(session_id, recorded_at);