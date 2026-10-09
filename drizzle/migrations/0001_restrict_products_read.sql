DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Business roles can view products" ON public.products FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin','techadmin','commercial','logistique','financier']::public.app_role[]));
DROP POLICY IF EXISTS "Authenticated can view categories" ON public.product_categories;
CREATE POLICY "Business roles can view categories" ON public.product_categories FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin','techadmin','commercial','logistique','financier']::public.app_role[]));