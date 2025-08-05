-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create initial database user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'xdate_user') THEN
        CREATE USER xdate_user WITH PASSWORD 'xdate_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE xdate TO xdate_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO xdate_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO xdate_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO xdate_user;