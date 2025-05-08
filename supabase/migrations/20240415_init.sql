-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Insert default categories
INSERT INTO public.categories (id, name, description, icon, created_at, updated_at) VALUES
    ('3fa85f64-5717-4562-b3fc-2c963f66afa6', 'string', 'string', 'string', '2025-04-16T04:05:32.971Z', '2025-04-16T04:05:32.971Z');

-- Add additional default categories
INSERT INTO public.categories (name, icon) VALUES
    ('Music Concerts', 'music'),
    ('Festivals', 'party-popper'),
    ('Sport', 'trophy'),
    ('Cinema', 'clapperboard'),
    ('Art & Culture', 'palette'),
    ('Food & Drink', 'utensils'),
    ('Business', 'briefcase'),
    ('Workshops', 'book-open')
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_validations ENABLE ROW LEVEL SECURITY;

-- Categories policies (everyone can read, only admin can write)
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for admins only" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Enable update for admins only" ON public.categories FOR UPDATE USING (auth.role() = 'admin');

-- Payment methods policies (users can only access their own payment methods)
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
    USING (auth.uid() = user_id);

-- Ticket validations policies (users can read their own tickets' validations)
CREATE POLICY "Users can view their tickets' validations" ON public.ticket_validations
    USING (EXISTS (
        SELECT 1 FROM tickets 
        WHERE tickets.id = ticket_validations.ticket_id 
        AND tickets.user_id = auth.uid()
    ));
CREATE POLICY "Operators can create validations" ON public.ticket_validations
    FOR INSERT WITH CHECK (auth.role() IN ('admin', 'operator')); 