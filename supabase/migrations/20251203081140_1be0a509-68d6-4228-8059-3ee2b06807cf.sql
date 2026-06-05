-- Create poojas table
CREATE TABLE public.poojas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration TEXT,
  category TEXT,
  image_url TEXT,
  benefits TEXT[],
  items_included TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pooja_bookings table
CREATE TABLE public.pooja_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pooja_id UUID NOT NULL REFERENCES public.poojas(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TEXT,
  status TEXT DEFAULT 'pending',
  special_requests TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pooja_bookings ENABLE ROW LEVEL SECURITY;

-- Poojas policies (public read, admin manage)
CREATE POLICY "Anyone can view poojas" ON public.poojas FOR SELECT USING (true);
CREATE POLICY "Only admins can manage poojas" ON public.poojas FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Pooja bookings policies
CREATE POLICY "Users can view their own bookings" ON public.pooja_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.pooja_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.pooja_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bookings" ON public.pooja_bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_poojas_updated_at
BEFORE UPDATE ON public.poojas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample poojas
INSERT INTO public.poojas (name, description, price, duration, category, benefits, items_included) VALUES
('Ganesh Pooja', 'Invoke Lord Ganesha for new beginnings and removal of obstacles', 1100, '1-2 hours', 'Prosperity', ARRAY['Remove obstacles', 'New beginnings', 'Success in ventures'], ARRAY['Modak', 'Durva grass', 'Red flowers', 'Coconut']),
('Lakshmi Pooja', 'Attract wealth, prosperity and abundance with Goddess Lakshmi blessings', 2100, '2-3 hours', 'Wealth', ARRAY['Financial prosperity', 'Business growth', 'Material abundance'], ARRAY['Lotus flowers', 'Gold coins', 'Kumkum', 'Turmeric']),
('Satyanarayan Pooja', 'Seek blessings of Lord Vishnu for peace and fulfillment of wishes', 2500, '3-4 hours', 'Peace', ARRAY['Family harmony', 'Wish fulfillment', 'Spiritual growth'], ARRAY['Panchamrit', 'Tulsi', 'Yellow cloth', 'Fruits']),
('Navagraha Pooja', 'Pacify all nine planets and reduce negative planetary influences', 5100, '4-5 hours', 'Planetary', ARRAY['Reduce malefic effects', 'Career growth', 'Health improvement'], ARRAY['9 types of grains', '9 colors cloth', 'Specific flowers', 'Ghee lamps']),
('Rudrabhishek', 'Powerful Shiva pooja for health, prosperity and spiritual advancement', 3500, '2-3 hours', 'Health', ARRAY['Health restoration', 'Spiritual upliftment', 'Negative energy removal'], ARRAY['Milk', 'Honey', 'Curd', 'Bel leaves', 'Rudraksha']),
('Kaal Sarp Dosh Nivaran', 'Remove the effects of Kaal Sarp Dosh from your horoscope', 7500, '5-6 hours', 'Dosha Nivaran', ARRAY['Dosh removal', 'Life improvements', 'Peace of mind'], ARRAY['Silver snake', 'Black sesame', 'Specific mantras', 'Nag devta items']);
