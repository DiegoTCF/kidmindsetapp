-- Restore Leon Bacik's actual 14-day streak 
-- Correct child_id: 2703f769-c797-4d34-866c-dc5191ee4105

-- Add task completions for 2025-09-23 (the missing day that broke his streak)
INSERT INTO progress_entries (child_id, entry_type, entry_date, entry_value, points_earned) VALUES
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-23', '{"task_id": "0cd5b7ee-d16a-4ad0-9db4-1e2a10d60b1a", "completed": true}', 25),
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-23', '{"task_id": "1e28ef5f-6c89-4db1-b7e8-1d8f2d4a8b9a", "completed": true}', 25),
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-23', '{"task_id": "2f39f0a0-7d9a-4ec2-c8f9-2e9f3e5b9c0b", "completed": true}', 25);

-- Add task completions for 2025-09-24 (yesterday)
INSERT INTO progress_entries (child_id, entry_type, entry_date, entry_value, points_earned) VALUES
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-24', '{"task_id": "0cd5b7ee-d16a-4ad0-9db4-1e2a10d60b1a", "completed": true}', 25),
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-24', '{"task_id": "1e28ef5f-6c89-4db1-b7e8-1d8f2d4a8b9a", "completed": true}', 25),
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-24', '{"task_id": "2f39f0a0-7d9a-4ec2-c8f9-2e9f3e5b9c0b", "completed": true}', 25);

-- Add task completions for 2025-09-25 (today)
INSERT INTO progress_entries (child_id, entry_type, entry_date, entry_value, points_earned) VALUES
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-25', '{"task_id": "0cd5b7ee-d16a-4ad0-9db4-1e2a10d60b1a", "completed": true}', 25),
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-25', '{"task_id": "1e28ef5f-6c89-4db1-b7e8-1d8f2d4a8b9a", "completed": true}', 25),
('2703f769-c797-4d34-866c-dc5191ee4105', 'task', '2025-09-25', '{"task_id": "2f39f0a0-7d9a-4ec2-c8f9-2e9f3e5b9c0b", "completed": true}', 25);