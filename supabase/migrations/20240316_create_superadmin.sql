-- Create superadmin user
DO $$
DECLARE
  superadmin_id uuid;
BEGIN
  -- Create auth user if not exists
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
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Super Admin","role":"superadmin"}'::jsonb,
    now(),
    now(),
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO superadmin_id;

  -- Get the user ID if insert didn't happen
  IF superadmin_id IS NULL THEN
    SELECT id INTO superadmin_id FROM auth.users WHERE email = 'ayushsingh1214@gmail.com';
  END IF;

  -- Create or update profile
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
    superadmin_id,
    'ayushsingh1214@gmail.com',
    'Super Admin',
    'superadmin',
    'active',
    '["all"]'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'superadmin',
    status = 'active',
    permissions = '["all"]'::jsonb,
    updated_at = now();

  -- Log activity
  INSERT INTO public.user_activity_logs (
    user_id,
    action,
    details
  )
  VALUES (
    superadmin_id,
    'admin_created',
    jsonb_build_object(
      'role', 'superadmin',
      'email', 'ayushsingh1214@gmail.com'
    )
  );
END;
$$;

-- Ensure proper permissions
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for superadmin access
CREATE POLICY "Superadmin can do anything"
  ON public.profiles
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'superadmin'
    )
  );