-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  category text,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Create cart items table
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create blogs table
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  author text DEFAULT 'Aachrya Team',
  tags text[],
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blogs"
  ON public.blogs FOR SELECT
  USING (true);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert sample products
INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
('Natural Gemstone Bracelet', 'Handcrafted gemstone bracelet for positive energy and healing', 1499.00, 'Gemstones', 50, '/placeholder.svg'),
('Rudraksha Mala', 'Authentic 108 beads Rudraksha mala for meditation and spiritual growth', 2999.00, 'Spiritual', 30, '/placeholder.svg'),
('Crystal Pyramid', 'Clear quartz crystal pyramid for Vastu and positive energy', 899.00, 'Crystals', 40, '/placeholder.svg'),
('Zodiac Pendant', 'Sterling silver zodiac sign pendant with birthstone', 1999.00, 'Jewelry', 60, '/placeholder.svg'),
('Yantra Plate', 'Engraved copper Sri Yantra plate for prosperity', 749.00, 'Yantras', 35, '/placeholder.svg'),
('Astrology Birth Chart', 'Personalized detailed birth chart analysis', 499.00, 'Services', 100, '/placeholder.svg'),
('Healing Crystals Set', 'Set of 7 chakra healing crystals with pouch', 1299.00, 'Crystals', 45, '/placeholder.svg'),
('Puja Kit', 'Complete puja essentials kit for home rituals', 599.00, 'Spiritual', 55, '/placeholder.svg'),
('Feng Shui Coins', 'Set of Chinese lucky coins for wealth and prosperity', 299.00, 'Feng Shui', 70, '/placeholder.svg'),
('Meditation Cushion', 'Organic cotton meditation cushion with mandala design', 1599.00, 'Accessories', 25, '/placeholder.svg');

-- Insert sample blogs
INSERT INTO public.blogs (title, excerpt, content, cover_image, tags) VALUES
('Understanding Your Zodiac Sign', 'Discover the unique traits and characteristics of your zodiac sign', 'Each zodiac sign carries unique energies and characteristics that influence our personality, relationships, and life path. Understanding your sun sign is the first step in astrological self-discovery. Learn how your zodiac sign shapes your strengths, weaknesses, and destiny.', '/placeholder.svg', ARRAY['Astrology', 'Zodiac', 'Self-Discovery']),
('The Power of Gemstones in Astrology', 'How gemstones can enhance your astrological energies', 'Gemstones have been used for centuries to balance planetary energies and enhance positive influences in our lives. Each gemstone corresponds to specific planets and can help mitigate negative effects while amplifying beneficial ones. Discover which gemstone is perfect for your birth chart.', '/placeholder.svg', ARRAY['Gemstones', 'Astrology', 'Healing']),
('Retrograde Planets: What They Mean', 'Understanding the impact of retrograde planets in your chart', 'When planets appear to move backward in the sky, they are said to be in retrograde. This phenomenon has significant astrological implications. Mercury retrograde affects communication, while other retrograde planets influence different aspects of life. Learn how to navigate these cosmic events.', '/placeholder.svg', ARRAY['Planets', 'Retrograde', 'Astrology']),
('Vastu Shastra for Your Home', 'Ancient science of architecture and positive energy', 'Vastu Shastra is the ancient Indian science of architecture that harmonizes your living space with natural energies. By following Vastu principles, you can create a balanced environment that promotes health, wealth, and happiness. Explore simple Vastu tips for every room in your home.', '/placeholder.svg', ARRAY['Vastu', 'Home', 'Energy']),
('Love Compatibility by Zodiac', 'Find your perfect match based on astrological compatibility', 'Astrological compatibility goes beyond sun signs. Understanding Venus, Mars, and Moon placements can reveal deeper insights into romantic relationships. Discover which zodiac signs are most compatible with yours and learn how to nurture harmonious relationships through astrology.', '/placeholder.svg', ARRAY['Love', 'Compatibility', 'Relationships']);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();