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

-- Create initial superadmin if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'ayushsingh1214@gmail.com'
  ) THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      instance_id
    )
    VALUES (
      'ayushsingh1214@gmail.com',
      crypt('Ayushsingh69@', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Super Admin","role":"superadmin"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      '00000000-0000-0000-0000-000000000000'
    );
  END IF;
END;
$$;

-- Ensure superadmin has proper permissions
UPDATE public.profiles
SET 
  role = 'superadmin',
  permissions = '["all"]'::jsonb,
  status = 'active'
WHERE email = 'ayushsingh1214@gmail.com';