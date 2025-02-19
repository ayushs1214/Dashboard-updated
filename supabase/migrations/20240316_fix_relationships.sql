-- Fix relationships between orders and profiles
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey CASCADE;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey CASCADE;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_updated_by_fkey CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_updated_by_fkey 
FOREIGN KEY (updated_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Fix relationships between payments and orders
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey CASCADE;

ALTER TABLE public.payments
ADD CONSTRAINT payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);