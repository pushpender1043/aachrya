-- Add user_id column to astrologers table to link with auth.users
ALTER TABLE public.astrologers 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_astrologers_user_id ON public.astrologers(user_id);

-- Add RLS policy for astrologers to view consultation messages where they are the astrologer
CREATE POLICY "Astrologers can view their consultation messages"
ON public.consultation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.astrologers 
    WHERE astrologers.user_id = auth.uid() 
    AND astrologers.id::text = consultation_messages.astrologer_id
  )
);

-- Add RLS policy for astrologers to insert responses to consultations
CREATE POLICY "Astrologers can respond to consultations"
ON public.consultation_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.astrologers 
    WHERE astrologers.user_id = auth.uid() 
    AND astrologers.id::text = consultation_messages.astrologer_id
  )
);