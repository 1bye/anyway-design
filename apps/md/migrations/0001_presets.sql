PRAGMA foreign_keys = ON;

CREATE TABLE libraries (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL UNIQUE,
  recovery_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE presets (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manifest TEXT NOT NULL CHECK (json_valid(manifest)),
  bytes INTEGER NOT NULL CHECK (bytes > 0 AND bytes <= 1048576),
  updated_at INTEGER NOT NULL
);
CREATE INDEX presets_owner ON presets(owner_id);

CREATE TRIGGER preset_insert_quota BEFORE INSERT ON presets BEGIN
  SELECT CASE WHEN (SELECT COUNT(*) FROM presets WHERE owner_id = NEW.owner_id) >= 5
    THEN RAISE(ABORT, 'preset_count_limit') END;
  SELECT CASE WHEN (SELECT COALESCE(SUM(bytes), 0) FROM presets WHERE owner_id = NEW.owner_id) + NEW.bytes > 1048576
    THEN RAISE(ABORT, 'preset_storage_limit') END;
END;

CREATE TRIGGER preset_update_quota BEFORE UPDATE ON presets BEGIN
  SELECT CASE WHEN (SELECT COALESCE(SUM(bytes), 0) FROM presets WHERE owner_id = NEW.owner_id AND id != NEW.id) + NEW.bytes > 1048576
    THEN RAISE(ABORT, 'preset_storage_limit') END;
END;

CREATE TABLE rate_limits (key TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, hits INTEGER NOT NULL);
CREATE INDEX rate_limits_expiry ON rate_limits(expires_at);
