-- Programs table
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active programs"
ON public.programs FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage programs"
ON public.programs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  purchase_url text NOT NULL DEFAULT '',
  discount_code text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Section settings table
CREATE TABLE public.section_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.section_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read section settings"
ON public.section_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage section settings"
ON public.section_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed default section settings
INSERT INTO public.section_settings (section_key, is_visible) VALUES
  ('programs', true),
  ('products', true),
  ('resources', true),
  ('testimonials', true);