-- Migration 025: Seed super admin user
-- Sets admin@bloxs.com.br as SUPER_ADMIN in team_members.
-- Safe to re-run: uses ON CONFLICT to never downgrade an existing role accidentally.

INSERT INTO team_members (id, email, name, role)
VALUES (
    '34f81c9b-4eca-44b5-8f7f-1db5752da2cf',
    'admin@bloxs.com.br',
    'Admin Bloxs',
    'SUPER_ADMIN'
)
ON CONFLICT (id) DO UPDATE
    SET role  = 'SUPER_ADMIN',
        email = EXCLUDED.email;
