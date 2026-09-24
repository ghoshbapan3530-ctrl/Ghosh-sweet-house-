-- ==============================================================================
-- GHOSH SWEET HOUSE: SUPABASE DATABASE SCHEMA, RPCs & RLS POLICIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- It establishes the exact loyalty tables, secure database functions (RPCs),
-- row-level security (RLS) policies, and anti-abuse transaction logs.
-- ==============================================================================

-- 1. Enable pgcrypto (for UUID generation if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOMERS TABLE (Permanent Customer Identity linked to Supabase auth.users.id)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    sweet_points INTEGER NOT NULL DEFAULT 0 CHECK (sweet_points >= 0),
    total_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_points_earned >= 0),
    total_points_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (total_points_redeemed >= 0),
    qualifying_orders_count INTEGER NOT NULL DEFAULT 0 CHECK (qualifying_orders_count >= 0 AND qualifying_orders_count <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for phone lookups and auth_user_id queries
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON public.customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 3. SWEET POINT TRANSACTIONS TABLE (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.sweet_point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id TEXT,
    points INTEGER NOT NULL, -- positive for credit/bonus, negative for debit/redemption
    reason TEXT NOT NULL,     -- e.g. "Signup Bonus", "Order Purchase", "Order Redemption"
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sweet_point_transactions_customer_id ON public.sweet_point_transactions(customer_id);

-- 4. ORDERS TABLE (Orders with Server-Side Qualification & Status)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. "GSH-7892"
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    new_customer_discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (new_customer_discount >= 0),
    points_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (points_redeemed >= 0),
    points_discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (points_discount_amount >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    final_total NUMERIC(10, 2) NOT NULL CHECK (final_total >= 0),
    points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    points_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    is_qualifying BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'Preparing' CHECK (status IN ('Preparing', 'Ready for Pickup', 'Completed', 'Cancelled')),
    order_type TEXT NOT NULL DEFAULT 'takeaway' CHECK (order_type IN ('delivery', 'takeaway')),
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    special_note TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_auth_user_id ON public.orders(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sweet_point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view only their own record
DROP POLICY IF EXISTS "Customers can view their own profile" ON public.customers;
CREATE POLICY "Customers can view their own profile"
    ON public.customers
    FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Customers cannot directly update points or order counts via DevTools!
-- Updates must flow through secure SECURITY DEFINER RPC functions.
DROP POLICY IF EXISTS "Customers can update their own name only" ON public.customers;
CREATE POLICY "Customers can update their own name only"
    ON public.customers
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Sweet point transactions can be viewed only by the owning customer
DROP POLICY IF EXISTS "Customers can view their own transactions" ON public.sweet_point_transactions;
CREATE POLICY "Customers can view their own transactions"
    ON public.sweet_point_transactions
    FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

-- Orders can be viewed by the user who placed them
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id OR auth.uid() IS NULL);

-- ==============================================================================
-- SECURE DATABASE FUNCTIONS (RPCs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- RPC 1: check_new_customer_discount(order_subtotal numeric)
-- Verifies customer eligibility purely on the server.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_new_customer_discount(order_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_customer RECORD;
    v_discount NUMERIC(10, 2);
    v_remaining INTEGER;
BEGIN
    v_user_id := auth.uid();

    -- 1. Must be authenticated
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'discount_amount', 0.00,
            'discount_percentage', 5,
            'reason_code', 'LOGIN_REQUIRED',
            'message', 'Login with your mobile number to access the New Customer Offer.',
            'qualifying_orders_count', 0,
            'remaining_offers', 5
        );
    END IF;

    -- 2. Lookup customer profile by auth_user_id
    SELECT * INTO v_customer
    FROM public.customers
    WHERE auth_user_id = v_user_id;

    IF NOT FOUND THEN
        -- Check if phone verified in auth.users
        RETURN jsonb_build_object(
            'eligible', false,
            'discount_amount', 0.00,
            'discount_percentage', 5,
            'reason_code', 'PHONE_NOT_VERIFIED',
            'message', 'Please verify your mobile number first.',
            'qualifying_orders_count', 0,
            'remaining_offers', 5
        );
    END IF;

    -- 3. Check if 5 qualifying orders have already been completed
    IF v_customer.qualifying_orders_count >= 5 THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'discount_amount', 0.00,
            'discount_percentage', 5,
            'reason_code', 'OFFER_COMPLETED',
            'message', 'You have completed your 5 New Customer Offers.',
            'qualifying_orders_count', v_customer.qualifying_orders_count,
            'remaining_offers', 0
        );
    END IF;

    -- 4. Check minimum order value: >= ₹100
    IF order_subtotal < 100 THEN
        v_remaining := 5 - v_customer.qualifying_orders_count;
        RETURN jsonb_build_object(
            'eligible', false,
            'discount_amount', 0.00,
            'discount_percentage', 5,
            'reason_code', 'MINIMUM_ORDER_100',
            'message', 'Minimum order value for this offer is ₹100.',
            'qualifying_orders_count', v_customer.qualifying_orders_count,
            'remaining_offers', v_remaining
        );
    END IF;

    -- 5. Eligible! Calculate 5% discount
    v_discount := ROUND((order_subtotal * 0.05)::numeric, 2);
    v_remaining := 5 - v_customer.qualifying_orders_count;

    RETURN jsonb_build_object(
        'eligible', true,
        'discount_amount', v_discount,
        'discount_percentage', 5,
        'reason_code', 'ELIGIBLE',
        'message', '5% New Customer Offer Applied',
        'qualifying_orders_count', v_customer.qualifying_orders_count,
        'remaining_offers', v_remaining
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 2: create_or_get_customer_profile(p_name text, p_phone text)
-- Links auth.users.id to public.customers.
-- Enforces: exactly 10 points bonus on first signup; never duplicate bonus on login.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_or_get_customer_profile(p_name TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_clean_phone TEXT;
    v_customer RECORD;
    v_new_customer_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Clean phone number (strip spaces/symbols, keep last 10 digits)
    v_clean_phone := RIGHT(regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g'), 10);
    IF length(v_clean_phone) < 10 THEN
        RAISE EXCEPTION 'A valid 10-digit mobile number is required.';
    END IF;

    -- Check if a customer record already exists for this auth_user_id OR phone
    SELECT * INTO v_customer
    FROM public.customers
    WHERE auth_user_id = v_user_id OR phone = v_clean_phone;

    IF FOUND THEN
        -- Existing customer account: attach auth_user_id if not linked, DO NOT re-award signup bonus
        IF v_customer.auth_user_id <> v_user_id THEN
            UPDATE public.customers
            SET auth_user_id = v_user_id, updated_at = now()
            WHERE id = v_customer.id;
        END IF;

        RETURN jsonb_build_object(
            'is_new', false,
            'customer', jsonb_build_object(
                'id', v_customer.id,
                'auth_user_id', v_user_id,
                'name', v_customer.name,
                'phone', v_customer.phone,
                'sweet_points', v_customer.sweet_points,
                'total_points_earned', v_customer.total_points_earned,
                'total_points_redeemed', v_customer.total_points_redeemed,
                'qualifying_orders_count', v_customer.qualifying_orders_count,
                'created_at', v_customer.created_at
            )
        );
    END IF;

    -- Brand new customer: Create profile & award 10 Sweet Points signup bonus exactly once
    INSERT INTO public.customers (
        auth_user_id,
        name,
        phone,
        sweet_points,
        total_points_earned,
        total_points_redeemed,
        qualifying_orders_count
    ) VALUES (
        v_user_id,
        COALESCE(NULLIF(TRIM(p_name), ''), 'Ghosh Sweet Customer'),
        v_clean_phone,
        10, -- 10 Sweet Points bonus
        10,
        0,
        0
    )
    RETURNING id INTO v_new_customer_id;

    -- Insert into sweet_point_transactions audit table
    INSERT INTO public.sweet_point_transactions (
        customer_id,
        points,
        reason
    ) VALUES (
        v_new_customer_id,
        10,
        'Signup Bonus'
    );

    RETURN jsonb_build_object(
        'is_new', true,
        'customer', jsonb_build_object(
            'id', v_new_customer_id,
            'auth_user_id', v_user_id,
            'name', COALESCE(NULLIF(TRIM(p_name), ''), 'Ghosh Sweet Customer'),
            'phone', v_clean_phone,
            'sweet_points', 10,
            'total_points_earned', 10,
            'total_points_redeemed', 0,
            'qualifying_orders_count', 0,
            'created_at', now()
        )
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 3: complete_qualifying_order(p_order_id text)
-- Called when order status changes to 'Completed'.
-- Idempotent: increments qualifying_orders only once, awards spending points only once.
-- Formula: floor(eligible_spending / 100) * 5
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_qualifying_order(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order RECORD;
    v_customer RECORD;
    v_points_earned INTEGER;
    v_is_qualifying BOOLEAN := false;
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found');
    END IF;

    -- Prevent duplicate processing
    IF v_order.points_awarded THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Order was already completed and processed.',
            'already_processed', true
        );
    END IF;

    -- Only proceed if there is an associated customer
    IF v_order.customer_id IS NOT NULL THEN
        SELECT * INTO v_customer
        FROM public.customers
        WHERE id = v_order.customer_id;

        IF FOUND THEN
            -- Check qualifying order rule: subtotal >= 100 AND customer has < 5 qualifying orders
            IF v_order.subtotal >= 100 AND v_customer.qualifying_orders_count < 5 THEN
                v_is_qualifying := true;
                UPDATE public.customers
                SET qualifying_orders_count = LEAST(5, qualifying_orders_count + 1),
                    updated_at = now()
                WHERE id = v_customer.id;
            END IF;

            -- Calculate purchase Sweet Points: floor(subtotal / 100) * 5
            v_points_earned := FLOOR(v_order.subtotal / 100) * 5;

            IF v_points_earned > 0 THEN
                UPDATE public.customers
                SET sweet_points = sweet_points + v_points_earned,
                    total_points_earned = total_points_earned + v_points_earned,
                    updated_at = now()
                WHERE id = v_customer.id;

                INSERT INTO public.sweet_point_transactions (
                    customer_id,
                    order_id,
                    points,
                    reason
                ) VALUES (
                    v_customer.id,
                    p_order_id,
                    v_points_earned,
                    'Order Purchase'
                );
            END IF;
        END IF;
    END IF;

    -- Mark order as completed and points_awarded = true
    UPDATE public.orders
    SET status = 'Completed',
        points_awarded = true,
        is_qualifying = v_is_qualifying,
        points_earned = COALESCE(v_points_earned, 0),
        completed_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'points_awarded', COALESCE(v_points_earned, 0),
        'is_qualifying', v_is_qualifying
    );
END;
$$;
