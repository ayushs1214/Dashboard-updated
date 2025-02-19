-- Fix schema issues

-- Fix the application_type column
ALTER TABLE public.products 
DROP COLUMN IF EXISTS application_type CASCADE;

ALTER TABLE public.products 
ADD COLUMN application_type text NOT NULL DEFAULT 'floor'
CHECK (application_type IN ('highlighter', 'wall', 'floor', 'outdoor', 'other'));

-- Fix foreign key relationships for orders
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

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Ensure superadmin has proper permissions
UPDATE profiles 
SET permissions = '["all"]'::jsonb,
    status = 'active'
WHERE email = 'ayushietetsec@gmail.com';