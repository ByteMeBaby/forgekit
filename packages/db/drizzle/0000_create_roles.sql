DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'forgekit_owner') THEN
    CREATE ROLE forgekit_owner LOGIN NOSUPERUSER;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'forgekit_app') THEN
    CREATE ROLE forgekit_app LOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'forgekit_operator') THEN
    CREATE ROLE forgekit_operator LOGIN NOSUPERUSER BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO forgekit_app, forgekit_operator;
