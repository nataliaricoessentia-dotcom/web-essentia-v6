CREATE TABLE public.free_resource_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  resource_id uuid REFERENCES public.free_resources(id) ON DELETE SET NULL,
  resource_title text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.free_resource_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
ON public.free_resource_leads
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
ON public.free_resource_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
ON public.free_resource_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));