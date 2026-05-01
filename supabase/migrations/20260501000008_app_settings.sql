CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings are viewable by everyone" ON public.app_settings 
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can insert settings" ON public.app_settings 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update settings" ON public.app_settings 
  FOR UPDATE USING (public.is_admin());
