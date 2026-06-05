-- Fix consultation_messages: Add length constraint on content field
ALTER TABLE public.consultation_messages
ADD CONSTRAINT content_max_length CHECK (length(content) <= 10000);

-- Fix the update_updated_at_column function to have a fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;