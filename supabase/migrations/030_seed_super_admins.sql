-- Migration 030: Seed official Super Admin users
-- Ensures carlos.carneiro@bloxs.com.br, raphael.franco@bloxs.com.br, diego.sorrilha@bloxs.com.br
-- have SUPER_ADMIN role in team_members.

INSERT INTO team_members (id, email, name, role)
VALUES
    (gen_random_uuid(), 'carlos.carneiro@bloxs.com.br', 'Carlos Carneiro', 'SUPER_ADMIN'),
    (gen_random_uuid(), 'raphael.franco@bloxs.com.br', 'Raphael Franco', 'SUPER_ADMIN'),
    (gen_random_uuid(), 'diego.sorrilha@bloxs.com.br', 'Diego Sorrilha', 'SUPER_ADMIN')
ON CONFLICT (email) DO UPDATE
    SET role = 'SUPER_ADMIN';
