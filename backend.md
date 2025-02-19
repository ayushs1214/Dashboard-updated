# Milagro Admin Dashboard - Backend Documentation

## Overview
This document outlines the comprehensive backend architecture and requirements for the Milagro Admin Dashboard using Supabase as the backend service. The system is designed to handle product management, order processing, user management, and analytics for a tile and sanitaryware business.

## Role-Based Access Control

### User Roles
1. **Superadmin**
   - Full system access
   - Can view product costs
   - Can approve dealers
   - Can assign users to admins
   - Can access all analytics

2. **Admin**
   - Limited to assigned users
   - Cannot view product costs
   - Limited pre-order access
   - Can view performance metrics for assigned users
   - Basic user management for assigned users

3. **Dealer**
   - Product catalog access
   - Order management
   - Sample requests
   - Performance tracking

4. **Architect/Builder**
   - Product catalog access
   - Sample management
   - Project tracking

### Permissions System
- Granular permission control
- Role-based default permissions
- Custom permission assignments
- Hierarchical access structure

## Analytics System

### Revenue Analytics
1. **User Type Revenue**
   - Dealer revenue
   - Architect revenue
   - Builder revenue
   - Historical trends

2. **Sales Performance**
   - Salesperson revenue
   - Team performance
   - Commission tracking
   - Goal achievement

3. **Product Analytics**
   - Item group revenue
   - Category performance
   - Stock movement
   - Slow-moving items

4. **Geographic Analysis**
   - Area-wise revenue (T1, T2)
   - Regional performance
   - Territory analysis
   - Market penetration

5. **Cross Analysis**
   - Salesperson-Item group matrix
   - Area-Item group matrix
   - Customer segment analysis

6. **Order Analysis**
   - No orders (30 days)
   - Sample conversion tracking
   - Order value analysis
   - Seasonal trends

### Performance Metrics
1. **Sales Metrics**
   - Revenue targets
   - Conversion rates
   - Average order value
   - Customer acquisition

2. **Inventory Metrics**
   - Stock turnover
   - Dead stock
   - Reorder points
   - Stock valuation

3. **Customer Metrics**
   - Active customers
   - Customer retention
   - Order frequency
   - Customer lifetime value

## Database Schema

[Previous schema documentation remains unchanged]

## API Endpoints

[Previous API documentation with updated endpoints for analytics]

## Security Implementation

### Access Control
```sql
-- Example RLS Policy for Product Cost Visibility
CREATE POLICY "Hide product costs from non-superadmin"
  ON products
  FOR SELECT
  USING (
    CASE 
      WHEN auth.role() IN ('admin', 'dealer', 'architect', 'builder')
      THEN msp IS NULL
      ELSE TRUE
    END
  );

-- Example RLS Policy for User Assignment
CREATE POLICY "Admins can only view assigned users"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT admin_id 
      FROM user_assignments 
      WHERE user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 
      FROM profiles
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );
```

### Data Security
- Row Level Security (RLS)
- Column-level encryption
- Audit logging
- Access tracking

## Analytics Functions

### Revenue Analysis
```sql
-- Example function for dealer revenue analysis
CREATE OR REPLACE FUNCTION get_dealer_revenue(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  dealer_name TEXT,
  revenue DECIMAL,
  order_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    SUM(o.total_amount),
    COUNT(o.id)
  FROM profiles p
  LEFT JOIN orders o ON o.user_id = p.id
  WHERE p.role = 'dealer'
    AND o.created_at BETWEEN start_date AND end_date
  GROUP BY p.name;
END;
$$;
```

[Additional analytics functions documentation]

## Deployment Process

[Previous deployment documentation remains unchanged]

## Monitoring & Maintenance

[Previous monitoring documentation remains unchanged]

## Error Handling

[Previous error handling documentation remains unchanged]