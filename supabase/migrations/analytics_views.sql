-- Drop existing views
DROP VIEW IF EXISTS public.dashboard_metrics CASCADE;
DROP VIEW IF EXISTS public.revenue_trend CASCADE;
DROP VIEW IF EXISTS public.user_trend CASCADE;
DROP VIEW IF EXISTS public.user_distribution CASCADE;
DROP VIEW IF EXISTS public.order_status_distribution CASCADE;

-- Create analytics tables if they don't exist
CREATE TABLE IF NOT EXISTS public.revenue_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_users INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to get dashboard metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  current_users INT;
  previous_users INT;
  current_orders INT;
  previous_orders INT;
  current_revenue DECIMAL;
  previous_revenue DECIMAL;
  current_approvals INT;
  previous_approvals INT;
BEGIN
  -- Get current metrics
  SELECT COUNT(*) INTO current_users 
  FROM public.profiles 
  WHERE role NOT IN ('admin', 'superadmin');
  
  SELECT COUNT(*) INTO current_orders 
  FROM public.orders 
  WHERE status IN ('pending', 'processing');
  
  SELECT COALESCE(SUM(amount), 0) INTO current_revenue 
  FROM public.revenue_analytics 
  WHERE date >= CURRENT_DATE - INTERVAL '30 days';
  
  SELECT COUNT(*) INTO current_approvals 
  FROM public.profiles 
  WHERE status = 'pending' AND role NOT IN ('admin', 'superadmin');

  -- Get previous metrics (30 days ago)
  SELECT COUNT(*) INTO previous_users 
  FROM public.profiles 
  WHERE role NOT IN ('admin', 'superadmin')
  AND created_at < CURRENT_DATE - INTERVAL '30 days';
  
  SELECT COUNT(*) INTO previous_orders 
  FROM public.orders 
  WHERE status IN ('pending', 'processing')
  AND created_at < CURRENT_DATE - INTERVAL '30 days';
  
  SELECT COALESCE(SUM(amount), 0) INTO previous_revenue 
  FROM public.revenue_analytics 
  WHERE date >= CURRENT_DATE - INTERVAL '60 days'
  AND date < CURRENT_DATE - INTERVAL '30 days';
  
  SELECT COUNT(*) INTO previous_approvals 
  FROM public.profiles 
  WHERE status = 'pending' 
  AND role NOT IN ('admin', 'superadmin')
  AND created_at < CURRENT_DATE - INTERVAL '30 days';

  -- Calculate percentage changes
  SELECT json_build_object(
    'total_users', json_build_object(
      'value', current_users,
      'change', CASE 
        WHEN previous_users = 0 THEN 0
        ELSE ROUND(((current_users - previous_users)::NUMERIC / previous_users * 100)::NUMERIC, 1)
      END
    ),
    'active_orders', json_build_object(
      'value', current_orders,
      'change', CASE 
        WHEN previous_orders = 0 THEN 0
        ELSE ROUND(((current_orders - previous_orders)::NUMERIC / previous_orders * 100)::NUMERIC, 1)
      END
    ),
    'revenue', json_build_object(
      'value', current_revenue,
      'change', CASE 
        WHEN previous_revenue = 0 THEN 0
        ELSE ROUND(((current_revenue - previous_revenue) / previous_revenue * 100)::NUMERIC, 1)
      END
    ),
    'pending_approvals', json_build_object(
      'value', current_approvals,
      'change', CASE 
        WHEN previous_approvals = 0 THEN 0
        ELSE ROUND(((current_approvals - previous_approvals)::NUMERIC / previous_approvals * 100)::NUMERIC, 1)
      END
    )
  ) INTO result;
  
  RETURN result;
END;
$$;