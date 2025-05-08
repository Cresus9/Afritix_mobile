-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    last4 VARCHAR(4) NOT NULL,
    expiry_date VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_validations table
CREATE TABLE IF NOT EXISTS public.ticket_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    success BOOLEAN DEFAULT true,
    location VARCHAR(255),
    operator_id UUID,
    operator_name VARCHAR(255),
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_validations_ticket_id ON public.ticket_validations(ticket_id);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO public.categories (name, description, icon)
VALUES 
    ('Music Concerts', 'Live performances from top artists', 'music'),
    ('Cinema', 'Movie premieres and film festivals', 'clapperboard'),
    ('Sports', 'Major sporting events', 'trophy'),
    ('Festivals', 'Cultural celebrations and festivals', 'party-popper'),
    ('Art & Culture', 'Art exhibitions and cultural events', 'palette'),
    ('Food & Drink', 'Culinary experiences and tastings', 'utensils'),
    ('Business', 'Professional and networking events', 'briefcase'),
    ('Workshops', 'Educational and skill-building sessions', 'book-open')
ON CONFLICT (name) DO NOTHING; 