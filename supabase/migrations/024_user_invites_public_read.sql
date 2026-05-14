-- Migration 024: Allow anonymous read of pending invites
-- Needed so the /invite page can validate a token without requiring service role key.
-- The token is a 64-char hex string (32 bytes of entropy), so guessing is not feasible.

DROP POLICY IF EXISTS "user_invites_anon_read" ON user_invites;

CREATE POLICY "user_invites_anon_read" ON user_invites
  FOR SELECT
  TO anon
  USING (status = 'pendente' AND expires_at > now());
