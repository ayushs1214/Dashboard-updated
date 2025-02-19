-- Drop existing auth handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new auth user handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    permissions,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    CASE 
      WHEN NEW.email = 'ayushsingh1214@gmail.com' THEN '["all"]'::jsonb
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'superadmin') THEN '["all"]'::jsonb
      ELSE '[]'::jsonb
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix application_type column
ALTER TABLE public.products 
DROP COLUMN IF EXISTS application_type CASCADE;

ALTER TABLE public.products 
ADD COLUMN application_type text NOT NULL DEFAULT 'floor'
CHECK (application_type IN ('highlighter', 'wall', 'floor', 'outdoor', 'other'));

-- Fix order relationships
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);