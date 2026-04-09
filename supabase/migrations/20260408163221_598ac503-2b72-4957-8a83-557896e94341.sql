
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active classes"
ON public.classes FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage classes"
ON public.classes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.section_settings (section_key, is_visible) VALUES ('clases', true)
ON CONFLICT (section_key) DO NOTHING;
