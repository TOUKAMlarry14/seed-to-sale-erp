-- Storage bucket for employee avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users (admin/rh) can upload
CREATE POLICY "Admin/RH can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role]));

CREATE POLICY "Admin/RH can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role]));

CREATE POLICY "Admin/RH can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role]));

-- Lock down SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;