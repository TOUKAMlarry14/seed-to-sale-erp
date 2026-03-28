
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'commercial', 'logistique', 'financier', 'rh', 'livreur');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user has any of several roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- RLS for profiles: users see own, admin sees all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- RLS for user_roles: only admins manage, users can read own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Autres',
  unit TEXT NOT NULL DEFAULT 'unité',
  price_buy NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_sell NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  stock_min INTEGER NOT NULL DEFAULT 10,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/commercial can manage products" ON public.products
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','commercial','logistique']::app_role[]));

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pro' CHECK (type IN ('pro', 'particulier')),
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/commercial can manage clients" ON public.clients
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','commercial']::app_role[]));

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/logistique can manage suppliers" ON public.suppliers
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','logistique']::app_role[]));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirme', 'livre', 'annule')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view orders" ON public.orders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/commercial can manage orders" ON public.orders
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','commercial']::app_role[]));

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view order items" ON public.order_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/commercial can manage order items" ON public.order_items
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','commercial']::app_role[]));

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'impaye' CHECK (status IN ('paye', 'impaye', 'partiel')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/commercial/financier can manage invoices" ON public.invoices
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','commercial','financier']::app_role[]));

-- Stock movements
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie')),
  quantity INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view stock movements" ON public.stock_movements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/logistique can manage stock movements" ON public.stock_movements
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','logistique']::app_role[]));

-- Deliveries
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  driver_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_cours', 'livre', 'echoue')),
  scheduled_date DATE,
  delivered_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view deliveries" ON public.deliveries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/logistique can manage deliveries" ON public.deliveries
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','logistique']::app_role[]));
CREATE POLICY "Drivers can view own deliveries" ON public.deliveries
  FOR SELECT TO authenticated USING (driver_id = auth.uid());

-- Transactions (finance)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('recette', 'depense')),
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Autres',
  description TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/financier can view transactions" ON public.transactions
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','financier']::app_role[]));
CREATE POLICY "Admin/financier can manage transactions" ON public.transactions
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','financier']::app_role[]));

-- Employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'commercial',
  phone TEXT DEFAULT '',
  salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/rh can view employees" ON public.employees
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','rh']::app_role[]));
CREATE POLICY "Admin/rh can manage employees" ON public.employees
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','rh']::app_role[]));

-- Attendances
CREATE TABLE public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'conge')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, date)
);
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/rh can view attendances" ON public.attendances
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','rh']::app_role[]));
CREATE POLICY "Admin/rh can manage attendances" ON public.attendances
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','rh']::app_role[]));

-- Payslips
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  gross_salary NUMERIC(12,2) NOT NULL,
  cnps_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, month, year)
);
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/rh can view payslips" ON public.payslips
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','rh']::app_role[]));
CREATE POLICY "Admin/rh can manage payslips" ON public.payslips
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['admin','rh']::app_role[]));

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
