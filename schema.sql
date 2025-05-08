-- Create event_categories table
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_event_category_name UNIQUE (name)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_categories_updated_at
    BEFORE UPDATE ON public.event_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO public.event_categories (id, name, description, icon, created_at, updated_at) VALUES
    ('3fa85f64-5717-4562-b3fc-2c963f66afa6', 'string', 'string', 'string', '2025-04-16T04:17:18.031Z', '2025-04-16T04:17:18.031Z')
ON CONFLICT (name) DO NOTHING;

-- Create ticket_validations table
CREATE TABLE IF NOT EXISTS public.ticket_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id),
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_by UUID REFERENCES public.users(id),
    location TEXT,
    device_id TEXT,
    status TEXT NOT NULL DEFAULT 'valid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_validations_ticket_id ON public.ticket_validations(ticket_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_validations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_validations_timestamp
    BEFORE UPDATE ON public.ticket_validations
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_validations_updated_at();

-- Add RLS policies
ALTER TABLE public.ticket_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ticket validations"
    ON public.ticket_validations
    FOR SELECT
    USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE user_id = auth.uid()
        )
        OR validated_by = auth.uid()
    );

CREATE POLICY "Only validators can create validations"
    ON public.ticket_validations
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'validator'
        )
    ); 