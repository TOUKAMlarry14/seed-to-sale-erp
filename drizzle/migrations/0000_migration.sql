DROP POLICY IF EXISTS "Authenticated can view orders" ON public.orders;
DO $$ DECLARE r record; BEGIN
 FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname='public' AND cmd='SELECT' AND qual='true' AND tablename IN ('orders','order_items','invoices','deliveries','stock_movements') LOOP
  EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
 END LOOP;
 FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='deliveries' AND qual='(driver_id = auth.uid())' LOOP
  EXECUTE format('DROP POLICY %I ON public.deliveries', r.policyname);
 END LOOP;
 FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='activity_logs' AND cmd='INSERT' LOOP
  EXECUTE format('DROP POLICY %I ON public.activity_logs', r.policyname);
 END LOOP;
END $$;

CREATE POLICY "Staff view orders" ON public.orders FOR SELECT TO authenticated USING (
 has_any_role(auth.uid(), ARRAY['admin','techadmin','commercial','financier','logistique']::app_role[])
 OR id IN (SELECT d.order_id FROM deliveries d JOIN employees e ON e.id=d.driver_id WHERE e.user_id=auth.uid()));
CREATE POLICY "Staff view order items" ON public.order_items FOR SELECT TO authenticated USING (
 has_any_role(auth.uid(), ARRAY['admin','techadmin','commercial','financier','logistique']::app_role[]));
CREATE POLICY "Staff view invoices" ON public.invoices FOR SELECT TO authenticated USING (
 has_any_role(auth.uid(), ARRAY['admin','techadmin','commercial','financier']::app_role[]));
CREATE POLICY "Staff view deliveries" ON public.deliveries FOR SELECT TO authenticated USING (
 has_any_role(auth.uid(), ARRAY['admin','techadmin','logistique','commercial']::app_role[])
 OR driver_id IN (SELECT id FROM employees WHERE user_id=auth.uid()));
CREATE POLICY "Driver updates own deliveries" ON public.deliveries FOR UPDATE TO authenticated
 USING (driver_id IN (SELECT id FROM employees WHERE user_id=auth.uid()))
 WITH CHECK (driver_id IN (SELECT id FROM employees WHERE user_id=auth.uid()));
CREATE POLICY "Staff view stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (
 has_any_role(auth.uid(), ARRAY['admin','techadmin','logistique','commercial','financier']::app_role[]));
CREATE POLICY "Users log own activity" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;