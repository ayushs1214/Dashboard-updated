-- Drop existing policies and functions
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create base policies without recursion
CREATE POLICY "Enable read access for everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for auth users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable self updates"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable admin management"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id 
      AND email = 'ayushietetsec@gmail.com'
    )
    OR 
    EXISTS (
      SELECT 1 FROM auth.users u
      JOIN public.profiles p ON u.id = p.id
      WHERE u.id = auth.uid() 
      AND p.role IN ('admin', 'superadmin')
    )
  );

-- Create improved user handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
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
    'active',
    CASE 
      WHEN NEW.email = 'ayushietetsec@gmail.com' THEN '["all"]'::jsonb
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'superadmin') THEN '["all"]'::jsonb
      ELSE '[]'::jsonb
    END,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Reset and create superadmin if needed
DO $$
BEGIN
  -- Only create if doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'ayushietetsec@gmail.com'
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
  END IF;
END $$;