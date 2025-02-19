-- Create functions for revenue analytics

-- Function to get dealer revenue
CREATE OR REPLACE FUNCTION get_dealer_revenue(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  name TEXT,
  value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    COALESCE(SUM(o.total_amount), 0) as value
  FROM profiles p
  LEFT JOIN orders o ON o.user_id = p.id
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status = 'delivered'
  WHERE p.role = 'dealer'
  GROUP BY p.name
  ORDER BY value DESC;
END;
$$;

-- Function to get salesperson revenue
CREATE OR REPLACE FUNCTION get_salesperson_revenue(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  name TEXT,
  value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    COALESCE(SUM(o.total_amount), 0) as value
  FROM profiles p
  LEFT JOIN user_assignments ua ON ua.admin_id = p.id
  LEFT JOIN orders o ON o.user_id = ua.user_id
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status = 'delivered'
  WHERE p.role = 'admin'
  GROUP BY p.name
  ORDER BY value DESC;
END;
$$;

-- Function to get item group revenue
CREATE OR REPLACE FUNCTION get_item_group_revenue(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  name TEXT,
  value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.name,
    COALESCE(SUM(oi.total_price), 0) as value
  FROM product_categories pc
  LEFT JOIN products p ON pc.id = ANY(p.categories)
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status = 'delivered'
  GROUP BY pc.name
  ORDER BY value DESC;
END;
$$;

-- Function to get area revenue
CREATE OR REPLACE FUNCTION get_area_revenue(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  name TEXT,
  value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (p.business_info->>'area')::text as name,
    COALESCE(SUM(o.total_amount), 0) as value
  FROM profiles p
  LEFT JOIN orders o ON o.user_id = p.id
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status = 'delivered'
  WHERE p.business_info->>'area' IS NOT NULL
  GROUP BY p.business_info->>'area'
  ORDER BY value DESC;
END;
$$;

-- Function to get salesperson-item group matrix
CREATE OR REPLACE FUNCTION get_salesperson_item_group_matrix(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  salesperson TEXT,
  item_group TEXT,
  value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name as salesperson,
    pc.name as item_group,
    COALESCE(SUM(oi.total_price), 0) as value
  FROM profiles p
  CROSS JOIN product_categories pc
  LEFT JOIN user_assignments ua ON ua.admin_id = p.id
  LEFT JOIN orders o ON o.user_id = ua.user_id
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status = 'delivered'
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products prod ON prod.id = oi.product_id
    AND pc.id = ANY(prod.categories)
  WHERE p.role = 'admin'
  GROUP BY p.name, pc.name
  ORDER BY p.name, pc.name;
END;
$$;

-- Function to get area-item group matrix
CREATE OR REPLACE FUNCTION get_area_item_group_matrix(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  area TEXT,
  item_group TEXT,
  value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (p.business_info->>'area')::text as area,
    pc.name as item_group,
    COALESCE(SUM(oi.total_price), 0) as value
  FROM profiles p
  CROSS JOIN product_categories pc
  LEFT JOIN orders o ON o.user_id = p.id
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status = 'delivered'
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products prod ON prod.id = oi.product_id
    AND pc.id = ANY(prod.categories)
  WHERE p.business_info->>'area' IS NOT NULL
  GROUP BY p.business_info->>'area', pc.name
  ORDER BY area, pc.name;
END;
$$;

-- Function to get accounts with no orders
CREATE OR REPLACE FUNCTION get_no_order_accounts(
  days INTEGER DEFAULT 30
)
RETURNS TABLE (
  name TEXT,
  last_order TIMESTAMPTZ,
  total_orders BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    MAX(o.created_at) as last_order,
    COUNT(o.id) as total_orders
  FROM profiles p
  LEFT JOIN orders o ON o.user_id = p.id
  WHERE p.role IN ('dealer', 'architect', 'builder')
  GROUP BY p.id, p.name
  HAVING MAX(o.created_at) < NOW() - (days || ' days')::INTERVAL
     OR MAX(o.created_at) IS NULL
  ORDER BY last_order DESC NULLS LAST;
END;
$$;

-- Function to get slow moving items
CREATE OR REPLACE FUNCTION get_slow_moving_items()
RETURNS TABLE (
  name TEXT,
  last_sold TIMESTAMPTZ,
  stock INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.series_name as name,
    MAX(o.created_at) as last_sold,
    p.stock
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id
  WHERE p.status = 'active'
  GROUP BY p.id, p.series_name, p.stock
  HAVING MAX(o.created_at) < NOW() - INTERVAL '90 days'
     OR MAX(o.created_at) IS NULL
  ORDER BY last_sold DESC NULLS LAST;
END;
$$;

-- Function to get samples with no orders
CREATE OR REPLACE FUNCTION get_sample_no_orders(
  min_order_limit DECIMAL
)
RETURNS TABLE (
  name TEXT,
  sample_date TIMESTAMPTZ,
  sample_quantity INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    sr.created_at as sample_date,
    sr.quantity as sample_quantity
  FROM sample_requests sr
  JOIN profiles p ON p.id = sr.user_id
  LEFT JOIN orders o ON o.user_id = sr.user_id
    AND o.created_at > sr.created_at
  WHERE sr.status = 'delivered'
  GROUP BY p.name, sr.created_at, sr.quantity
  HAVING COALESCE(SUM(o.total_amount), 0) < min_order_limit
  ORDER BY sr.created_at DESC;
END;
$$;