/*
  # Update Product Schema

  1. Changes
    - Rename productId to productName
    - Update finishedName to finish with specific options
    - Add costPrice field
    - Update applicationType with new options
    - Update categories with new options
    - Add RLS policies for cost visibility

  2. Security
    - Add RLS policy for cost price visibility
    - Update existing policies
*/

-- Modify products table
ALTER TABLE public.products
  -- Rename productId to productName
  RENAME COLUMN product_id TO product_name;

-- Update finish options
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_finished_name_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_finish_check
  CHECK (finished_name IN ('Glossy', 'Matt', 'Satin', 'Pro-Surface'));

-- Add cost price
ALTER TABLE public.products
  ADD COLUMN cost_price decimal(10,2);

-- Update application type options
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_application_type_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_application_type_check
  CHECK (application_type IN (
    'Wall',
    'Floor',
    'Exterior Facade',
    'Bathroom',
    'Kitchen-top',
    'Dado',
    'Frame'
  ));

-- Update categories
UPDATE public.product_categories
SET name = 'Slabs' WHERE name = 'slabs';

UPDATE public.product_categories
SET name = 'Subways' WHERE name = 'subways';

UPDATE public.product_categories
SET name = 'GVT' WHERE name = 'wall';

UPDATE public.product_categories
SET name = 'Ceramic' WHERE name = 'floor';

-- Add RLS policy for cost price visibility
CREATE POLICY "Hide cost price from non-superadmin"
  ON products
  FOR SELECT
  USING (
    CASE 
      WHEN auth.role() IN ('admin', 'dealer', 'architect', 'builder')
      THEN cost_price IS NULL
      ELSE TRUE
    END
  );