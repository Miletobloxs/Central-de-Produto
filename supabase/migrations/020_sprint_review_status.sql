-- Migration 020: Add 'review' to sprint status enum
ALTER TABLE sprints DROP CONSTRAINT IF EXISTS sprints_status_check;
ALTER TABLE sprints ADD CONSTRAINT sprints_status_check
  CHECK (status IN ('planning', 'active', 'review', 'completed'));
