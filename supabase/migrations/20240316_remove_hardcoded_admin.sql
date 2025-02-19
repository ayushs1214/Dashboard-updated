-- Remove hardcoded admin handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create a simpler function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    permissions
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'superadmin') THEN '["all"]'
      ELSE '[]'
    END::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing admin permissions
UPDATE public.profiles
SET permissions = '["all"]'::jsonb
WHERE role IN ('admin', 'superadmin');