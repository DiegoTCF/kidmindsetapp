-- =====================================================
-- CLIENT MANAGER / COACHING MANAGER SCHEMA
-- =====================================================

-- 1) Create coaching_plans table
CREATE TABLE public.coaching_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    billing_type TEXT NOT NULL CHECK (billing_type IN ('fixed', 'monthly')),
    default_sessions_per_period INTEGER,
    default_duration_weeks INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2) Create coaching_subscriptions table
CREATE TABLE public.coaching_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.coaching_plans(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    sessions_per_period INTEGER NOT NULL DEFAULT 1,
    period_type TEXT NOT NULL DEFAULT 'month' CHECK (period_type IN ('week', 'month')),
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    sessions_used_in_period INTEGER NOT NULL DEFAULT 0,
    total_sessions_used INTEGER NOT NULL DEFAULT 0,
    last_session_date DATE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3) Create coaching_session_logs table
CREATE TABLE public.coaching_session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.coaching_subscriptions(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    admin_notes TEXT,
    logged_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_coaching_subscriptions_child_id ON public.coaching_subscriptions(child_id);
CREATE INDEX idx_coaching_subscriptions_status ON public.coaching_subscriptions(status);
CREATE INDEX idx_coaching_subscriptions_plan_id ON public.coaching_subscriptions(plan_id);
CREATE INDEX idx_coaching_session_logs_subscription_id ON public.coaching_session_logs(subscription_id);

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================
CREATE TRIGGER update_coaching_plans_updated_at
    BEFORE UPDATE ON public.coaching_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_coaching_subscriptions_updated_at
    BEFORE UPDATE ON public.coaching_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.coaching_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_session_logs ENABLE ROW LEVEL SECURITY;

-- coaching_plans: Admin only
CREATE POLICY "Admin can manage coaching plans"
    ON public.coaching_plans
    FOR ALL
    TO authenticated
    USING (public.is_user_admin(auth.uid()))
    WITH CHECK (public.is_user_admin(auth.uid()));

-- coaching_subscriptions: Admin full access, players read own
CREATE POLICY "Admin can manage all subscriptions"
    ON public.coaching_subscriptions
    FOR ALL
    TO authenticated
    USING (public.is_user_admin(auth.uid()))
    WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "Players can view own subscription"
    ON public.coaching_subscriptions
    FOR SELECT
    TO authenticated
    USING (public.user_owns_child(child_id, auth.uid()));

-- coaching_session_logs: Admin only
CREATE POLICY "Admin can manage session logs"
    ON public.coaching_session_logs
    FOR ALL
    TO authenticated
    USING (public.is_user_admin(auth.uid()))
    WITH CHECK (public.is_user_admin(auth.uid()));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log a coaching session
CREATE OR REPLACE FUNCTION public.log_coaching_session(
    p_subscription_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_subscription coaching_subscriptions%ROWTYPE;
    v_is_over_limit BOOLEAN := false;
    v_session_id UUID;
BEGIN
    -- Verify admin permissions
    IF NOT is_user_admin(auth.uid()) THEN
        RETURN json_build_object('success', false, 'error', 'Admin access required');
    END IF;

    -- Get subscription
    SELECT * INTO v_subscription FROM coaching_subscriptions WHERE id = p_subscription_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Subscription not found');
    END IF;

    -- Check if over limit
    IF v_subscription.sessions_used_in_period >= v_subscription.sessions_per_period THEN
        v_is_over_limit := true;
    END IF;

    -- Create session log
    INSERT INTO coaching_session_logs (subscription_id, admin_notes, logged_by)
    VALUES (p_subscription_id, p_notes, auth.uid())
    RETURNING id INTO v_session_id;

    -- Update subscription
    UPDATE coaching_subscriptions
    SET 
        sessions_used_in_period = sessions_used_in_period + 1,
        total_sessions_used = total_sessions_used + 1,
        last_session_date = CURRENT_DATE
    WHERE id = p_subscription_id;

    RETURN json_build_object(
        'success', true,
        'session_id', v_session_id,
        'over_limit', v_is_over_limit,
        'new_sessions_used', v_subscription.sessions_used_in_period + 1,
        'sessions_per_period', v_subscription.sessions_per_period
    );
END;
$$;

-- Function to reset subscription period (for monthly)
CREATE OR REPLACE FUNCTION public.reset_subscription_period(p_subscription_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_subscription coaching_subscriptions%ROWTYPE;
    v_new_start DATE;
    v_new_end DATE;
BEGIN
    -- Verify admin permissions
    IF NOT is_user_admin(auth.uid()) THEN
        RETURN json_build_object('success', false, 'error', 'Admin access required');
    END IF;

    SELECT * INTO v_subscription FROM coaching_subscriptions WHERE id = p_subscription_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Subscription not found');
    END IF;

    -- Calculate new period
    IF v_subscription.period_type = 'month' THEN
        v_new_start := v_subscription.current_period_end + INTERVAL '1 day';
        v_new_end := (v_new_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    ELSE
        v_new_start := v_subscription.current_period_end + INTERVAL '1 day';
        v_new_end := (v_new_start + INTERVAL '1 week' - INTERVAL '1 day')::DATE;
    END IF;

    UPDATE coaching_subscriptions
    SET 
        current_period_start = v_new_start,
        current_period_end = v_new_end,
        sessions_used_in_period = 0
    WHERE id = p_subscription_id;

    RETURN json_build_object(
        'success', true,
        'new_period_start', v_new_start,
        'new_period_end', v_new_end
    );
END;
$$;

-- Function to auto-reset expired periods (call on page load)
CREATE OR REPLACE FUNCTION public.auto_reset_expired_periods()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER := 0;
    v_sub RECORD;
    v_new_start DATE;
    v_new_end DATE;
BEGIN
    -- Only admins can call this
    IF NOT is_user_admin(auth.uid()) THEN
        RETURN 0;
    END IF;

    FOR v_sub IN 
        SELECT * FROM coaching_subscriptions 
        WHERE status = 'active' 
        AND current_period_end < CURRENT_DATE
    LOOP
        -- Calculate new period
        IF v_sub.period_type = 'month' THEN
            v_new_start := v_sub.current_period_end + INTERVAL '1 day';
            v_new_end := (v_new_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
        ELSE
            v_new_start := v_sub.current_period_end + INTERVAL '1 day';
            v_new_end := (v_new_start + INTERVAL '1 week' - INTERVAL '1 day')::DATE;
        END IF;

        UPDATE coaching_subscriptions
        SET 
            current_period_start = v_new_start,
            current_period_end = v_new_end,
            sessions_used_in_period = 0
        WHERE id = v_sub.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- Insert some default plans
INSERT INTO public.coaching_plans (name, billing_type, default_sessions_per_period, default_duration_weeks, notes) VALUES
    ('12-Week Mentorship', 'fixed', NULL, 12, 'Intensive 12-week program'),
    ('Monthly 2 Sessions', 'monthly', 2, NULL, 'Standard monthly package'),
    ('Monthly 4 Sessions', 'monthly', 4, NULL, 'Premium monthly package'),
    ('Custom', 'monthly', 1, NULL, 'Flexible custom plan');