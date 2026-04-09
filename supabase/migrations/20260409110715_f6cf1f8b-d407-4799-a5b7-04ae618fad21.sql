
-- 1. Fix orders: drop constraint, update data, recreate
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
UPDATE public.orders SET status = 'confirmee' WHERE status = 'confirme';
UPDATE public.orders SET status = 'en_preparation' WHERE status = 'en preparation';
UPDATE public.orders SET status = 'livree' WHERE status = 'livre';
UPDATE public.orders SET status = 'annulee' WHERE status = 'annule';
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('en_attente', 'confirmee', 'en_preparation', 'livree', 'annulee'));

-- 2. Fix deliveries FK
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_driver_id_fkey;
UPDATE public.deliveries SET driver_id = NULL WHERE driver_id IS NOT NULL AND driver_id NOT IN (SELECT id FROM public.employees);
ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_driver_id_fkey 
  FOREIGN KEY (driver_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- 3. Add columns to employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email text DEFAULT '';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bonus_amount numeric DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bonus_reason text DEFAULT '';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bonus_expiry date;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS termination_date date;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS termination_reason text DEFAULT '';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS status text DEFAULT 'actif';

-- 4. Add columns to attendances
ALTER TABLE public.attendances ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.attendances ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.attendances ADD COLUMN IF NOT EXISTS reason text DEFAULT '';

-- 5. Add image_url
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  route text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assigned_to uuid,
  assigned_by uuid,
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'moyenne' CHECK (priority IN ('haute', 'moyenne', 'basse')),
  status text NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire', 'en_cours', 'termine')),
  department text DEFAULT '',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own todos" ON public.todos FOR SELECT TO authenticated USING (user_id = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Users can insert todos" ON public.todos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own todos" ON public.todos FOR UPDATE TO authenticated USING (user_id = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Users can delete own todos" ON public.todos FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 8. Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view categories" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage categories" ON public.product_categories FOR ALL TO authenticated USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'commercial'::app_role, 'logistique'::app_role]));

-- 9. Realtime on notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_todos_user ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_assigned ON public.todos(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 11. Trigger for todos
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON public.todos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Broaden employee visibility
DROP POLICY IF EXISTS "Admin/rh can view employees" ON public.employees;
CREATE POLICY "All authenticated can view employees" ON public.employees FOR SELECT TO authenticated USING (true);

-- 13. Broaden attendance visibility
DROP POLICY IF EXISTS "Admin/rh can view attendances" ON public.attendances;
CREATE POLICY "All authenticated can view attendances" ON public.attendances FOR SELECT TO authenticated USING (true);

-- 14. Broaden payslip visibility
DROP POLICY IF EXISTS "Admin/rh can view payslips" ON public.payslips;
CREATE POLICY "All authenticated can view payslips" ON public.payslips FOR SELECT TO authenticated USING (true);
