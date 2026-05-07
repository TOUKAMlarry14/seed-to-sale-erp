
-- Employees: restrict SELECT
DROP POLICY IF EXISTS "All authenticated can view employees" ON public.employees;
CREATE POLICY "Admin/RH or self can view employees"
ON public.employees FOR SELECT TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role])
  OR user_id = auth.uid()
);

-- Payslips: restrict SELECT
DROP POLICY IF EXISTS "All authenticated can view payslips" ON public.payslips;
CREATE POLICY "Admin/RH or self can view payslips"
ON public.payslips FOR SELECT TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role])
  OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Clients: restrict SELECT
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
CREATE POLICY "Admin/commercial can view clients"
ON public.clients FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'commercial'::app_role, 'financier'::app_role]));

-- Suppliers: restrict SELECT
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
CREATE POLICY "Admin/logistique can view suppliers"
ON public.suppliers FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'logistique'::app_role, 'financier'::app_role]));

-- Attendances: restrict SELECT
DROP POLICY IF EXISTS "All authenticated can view attendances" ON public.attendances;
CREATE POLICY "Admin/RH or self can view attendances"
ON public.attendances FOR SELECT TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role])
  OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Todos: prevent impersonation on insert
DROP POLICY IF EXISTS "Users can insert todos" ON public.todos;
CREATE POLICY "Users can insert own todos"
ON public.todos FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Notifications: restrict insert
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Self or admin/rh can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'rh'::app_role, 'commercial'::app_role, 'logistique'::app_role, 'financier'::app_role])
);
