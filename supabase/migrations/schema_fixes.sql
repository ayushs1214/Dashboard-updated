-- Fix the application_type column issue
ALTER TABLE public.products 
DROP COLUMN IF EXISTS application_type CASCADE;

ALTER TABLE public.products 
ADD COLUMN application_type text NOT NULL DEFAULT 'floor'
CHECK (application_type IN ('highlighter', 'wall', 'floor', 'outdoor', 'other'));

-- Fix the orders relationship issue
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey CASCADE;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey CASCADE;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_updated_by_fkey CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_updated_by_fkey 
FOREIGN KEY (updated_by) 
REFERENCES profiles(id) ON DELETE CASCADE;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  recipients jsonb NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Admins can manage notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    )
  );

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (
    CASE 
      WHEN (recipients->>'type')::text = 'all' THEN true
      WHEN (recipients->>'type')::text = 'role' THEN 
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = ANY((recipients->>'roles')::text[])
        )
      WHEN (recipients->>'type')::text = 'specific' THEN 
        auth.uid()::text = ANY((recipients->>'userIds')::text[])
      ELSE false
    END
  );