-- Create the categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    description TEXT,
    subcategories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add a unique constraint on the name
ALTER TABLE public.categories ADD CONSTRAINT categories_name_unique UNIQUE (name);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO public.categories (name, icon, description, subcategories)
VALUES 
    ('Music Concerts', 'music', 'Live performances from top artists', ARRAY['Afrobeats', 'Jazz', 'Traditional']),
    ('Cinema', 'clapperboard', 'Movie premieres and film festivals', ARRAY['Premieres', 'Film Festivals', 'Screenings']),
    ('Sports', 'trophy', 'Major sporting events', ARRAY['Football', 'Athletics', 'Boxing']),
    ('Festivals', 'party-popper', 'Cultural celebrations and festivals', ARRAY['Cultural', 'Food', 'Art', 'Music'])
ON CONFLICT (name) DO NOTHING; 