-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create simplified policies
CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Create improved auth trigger
CREATE OR REPLACE FUNCTION handle_new_user()
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
    CASE 
      WHEN NEW.email = 'ayushietetsec@gmail.com' THEN 'superadmin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    END,
    CASE 
      WHEN NEW.email = 'ayushietetsec@gmail.com' THEN 'active'
      ELSE 'active'
    END,
    CASE 
      WHEN NEW.email = 'ayushietetsec@gmail.com' THEN '["all"]'::jsonb
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'superadmin') THEN '["all"]'::jsonb
      ELSE '[]'::jsonb
    END,
    NOW(),
    NOW()
  );

  -- Log activity
  INSERT INTO public.user_activity_logs (
    user_id,
    action,
    details
  ) VALUES (
    NEW.id,
    'user_created',
    jsonb_build_object(
      'email', NEW.email,
      'role', CASE 
        WHEN NEW.email = 'ayushietetsec@gmail.com' THEN 'superadmin'
        ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
      END
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure superadmin exists with correct credentials
DO $$
BEGIN
  -- Delete existing superadmin if exists (to ensure clean state)
  DELETE FROM auth.users WHERE email = 'ayushietetsec@gmail.com';
  
  -- Create new superadmin
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
  ) VALUES (
    'ayushietetsec@gmail.com',
    crypt('Ayushsingh69@', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Super Admin","role":"superadmin"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
  );
END $$;