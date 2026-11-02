-- Revoke old sessions even if another application updates a user's identity.
-- Preserve an explicit increment made by logout, activation or account deletion.
CREATE FUNCTION revoke_sessions_on_identity_change() RETURNS trigger AS $$
BEGIN
  IF NEW."password" IS DISTINCT FROM OLD."password"
     OR NEW."role" IS DISTINCT FROM OLD."role"
     OR NEW."clientId" IS DISTINCT FROM OLD."clientId"
     OR NEW."status" IS DISTINCT FROM OLD."status"
     OR NEW."deletedAt" IS DISTINCT FROM OLD."deletedAt" THEN
    NEW."sessionVersion" := GREATEST(NEW."sessionVersion", OLD."sessionVersion" + 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_identity_revokes_sessions
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION revoke_sessions_on_identity_change();
