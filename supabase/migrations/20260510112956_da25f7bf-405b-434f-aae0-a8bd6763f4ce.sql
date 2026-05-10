
-- 1. Employees: drop self-select to hide salary/bonus/termination data
DROP POLICY IF EXISTS "Admin/RH or self can view employees" ON public.employees;
CREATE POLICY "Admin/RH can view employees"
ON public.employees FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role]));

-- 2. Todos: restrict INSERT to admin/techadmin
DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos;
CREATE POLICY "Admins can insert todos"
ON public.todos FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND has_any_role(auth.uid(), ARRAY['admin'::app_role, 'techadmin'::app_role])
);

-- 3. user_roles: include techadmin in management policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO public
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'techadmin'::app_role]));

-- 4. Avatars bucket: make private + scoped policies
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Authenticated can view avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
