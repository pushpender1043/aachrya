-- Create consultation_messages table
CREATE TABLE public.consultation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  astrologer_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'astrologer')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_consultation_messages_consultation_id ON public.consultation_messages(consultation_id);
CREATE INDEX idx_consultation_messages_user_id ON public.consultation_messages(user_id);

-- Enable Row Level Security
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own consultation messages"
ON public.consultation_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consultation messages"
ON public.consultation_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);