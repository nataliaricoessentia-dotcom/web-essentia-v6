
-- Testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Free resources table
CREATE TABLE public.free_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT NOT NULL DEFAULT '#',
  thumbnail_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.free_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resources" ON public.free_resources
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage resources" ON public.free_resources
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));
