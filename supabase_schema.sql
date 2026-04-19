-- Tabel Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    deposit_amount NUMERIC NOT NULL DEFAULT 0,
    outstanding_amount NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT CHECK (payment_status IN ('DP', 'Lunas')) DEFAULT 'DP',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    format TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
