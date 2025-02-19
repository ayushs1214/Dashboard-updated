# Milagro Admin Dashboard - API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication

All endpoints except `/auth/login` require JWT authentication.

### Headers
```http
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### Login
```http
POST /auth/login

Request Headers:
Content-Type: application/json

Request Body:
{
  "email": "ayushietetsec@gmail.com",
  "password": "Ayushsingh69@"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Super Admin",
    "email": "ayushietetsec@gmail.com",
    "role": "superadmin",
    "status": "active",
    "avatar": "url_to_avatar",
    "permissions": ["all"],
    "createdAt": "2024-03-15T10:30:00Z",
    "lastLogin": "2024-03-15T10:30:00Z"
  }
}

Response 401:
{
  "error": "Invalid credentials"
}
```

### User Management

#### List Users
```http
GET /users

Query Parameters:
- page (optional): Current page number (default: 1)
- limit (optional): Items per page (default: 10)
- role (optional): Filter by role (dealer, architect, builder)
- status (optional): Filter by status (active, inactive, pending)
- search (optional): Search by name or email
- assignedTo (optional): Filter by assigned admin ID

Response 200:
{
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "dealer",
      "status": "active",
      "avatar": "url_to_avatar",
      "businessInfo": {
        "companyName": "Doe Enterprises",
        "phone": "+91 98765 43210",
        "gstNumber": "29ABCDE1234F1Z5",
        "panNumber": "ABCDE1234F",
        "address": "123 Business District, Mumbai"
      },
      "assignedAdmin": {
        "id": "admin_id",
        "name": "Admin Name"
      },
      "createdAt": "2024-03-15T10:30:00Z",
      "lastLogin": "2024-03-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Approve Dealer
```http
POST /users/{id}/approve

Request Headers:
Content-Type: application/json

Request Body:
{
  "role": "dealer",
  "assignedAdmin": "admin_id"  // Optional, only for superadmin
}

Response 200:
{
  "success": true,
  "message": "Dealer approved successfully"
}

Response 403:
{
  "error": "Insufficient permissions"
}
```

### Product Management

#### List Products
```http
GET /products

Query Parameters:
- page (optional): Current page number (default: 1)
- limit (optional): Items per page (default: 10)
- category (optional): Filter by category
- status (optional): Filter by status
- search (optional): Search by name or ID

Response 200:
{
  "data": [
    {
      "id": "1",
      "productName": "Premium Tile",
      "seriesName": "Modern Collection",
      "finishedName": "Matte Black",
      "colors": [
        {
          "name": "Black",
          "image": "url_to_image"
        }
      ],
      "categories": ["wall", "floor"],
      "applicationType": "floor",
      "stock": 100,
      "price": 1200,
      "boxPacking": 10,
      "moqBoxes": 5,
      "thickness": 8,
      "weight": 2.5,
      "faces": 4,
      "hasLogo": true,
      "panelSize": {
        "value": 24,
        "unit": "inches"
      },
      "costPrice": 800,  // Only visible to superadmin
      "media": {
        "images": ["url1", "url2"],
        "videos": [],
        "documents": [],
        "models3d": []
      },
      "status": "active"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Create Product
```http
POST /products

Request Headers:
Content-Type: multipart/form-data

Request Body:
- productName: string (required)
- seriesName: string (required)
- finishedName: string (required) [Glossy, Matt, Satin, Pro-Surface]
- colors: JSON string (required) - Array of color objects
- categories: Array<string> (required) [Slabs, Subways, GVT, Ceramic]
- applicationType: string (required) [Wall, Floor, Exterior Facade, Bathroom, Kitchen-top, Dado, Frame]
- stock: number (required)
- price: number (required)
- boxPacking: number (required)
- moqBoxes: number (required)
- thickness: number (required)
- weight: number (required)
- faces: number (required)
- hasLogo: boolean (required)
- panelSize: JSON string (required) - { value: number, unit: string }
- costPrice: number (superadmin only)
- images: File[] (optional)

Response 200:
{
  "success": true,
  "data": {
    // Created product object
  }
}

Response 422:
{
  "error": "Validation failed",
  "details": {
    "field": ["error message"]
  }
}
```

### Order Management

#### List Orders
```http
GET /orders

Query Parameters:
- page (optional): Current page number (default: 1)
- limit (optional): Items per page (default: 10)
- status (optional): Filter by status
- userId (optional): Filter by user
- dateRange (optional): Filter by date range

Response 200:
{
  "data": [
    {
      "id": "1",
      "orderNumber": "ORD001",
      "poNumber": "PO123",
      "user": {
        "id": "user_id",
        "name": "John Doe"
      },
      "status": "pending",
      "items": [
        {
          "productId": "prod_id",
          "quantity": 5,
          "boxQuantity": 1,
          "price": 1200,
          "specialDiscount": {
            "type": "percentage",
            "value": 10
          }
        }
      ],
      "outOfStockAllowed": true,
      "expectedDeliveryDate": "2024-04-15",
      "inquiryDescription": "Sample inquiry text",
      "negotiationNotes": "Price negotiation details",
      "subtotal": 6000,
      "discount": 600,
      "total": 5400,
      "createdAt": "2024-03-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Sample Management

#### List Samples
```http
GET /samples

Query Parameters:
- page (optional): Current page number (default: 1)
- limit (optional): Items per page (default: 10)
- status (optional): Filter by status
- search (optional): Search by product or customer

Response 200:
{
  "data": [
    {
      "id": "1",
      "requestNumber": "SR001",
      "product": {
        "id": "prod_id",
        "name": "Premium Tile",
        "seriesName": "Modern Collection"
      },
      "requestedBy": {
        "id": "user_id",
        "name": "John Doe",
        "company": "Doe Enterprises"
      },
      "status": "design",  // order_received, design, dealer_approval, printing, warehouse, ready_for_dispatch, dispatched, delivered
      "quantity": 2,
      "trackingNumber": "TRK123456",
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedAt": "2024-03-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Analytics

#### Revenue Analytics
```http
GET /analytics/revenue

Query Parameters:
- startDate (required): Start date (YYYY-MM-DD)
- endDate (required): End date (YYYY-MM-DD)
- minOrderLimit (optional): Minimum order amount for analysis

Response 200:
{
  "dealerRevenue": [
    {
      "name": "Dealer Name",
      "value": 500000
    }
  ],
  "salesPersonRevenue": [
    {
      "name": "Sales Person",
      "value": 750000
    }
  ],
  "itemGroupRevenue": [
    {
      "name": "Category",
      "value": 300000
    }
  ],
  "areaRevenue": [
    {
      "name": "Region",
      "value": 450000
    }
  ],
  "salesPersonItemGroup": [
    {
      "salesperson": "Name",
      "itemGroup": "Category",
      "value": 150000
    }
  ],
  "areaItemGroup": [
    {
      "area": "Region",
      "itemGroup": "Category",
      "value": 200000
    }
  ],
  "noOrderAccounts": [
    {
      "name": "Customer Name",
      "lastOrder": "2024-02-15T10:30:00Z",
      "totalOrders": 5
    }
  ],
  "slowMovingItems": [
    {
      "name": "Product Name",
      "lastSold": "2024-01-15T10:30:00Z",
      "stock": 100
    }
  ],
  "sampleNoOrders": [
    {
      "name": "Customer Name",
      "sampleDate": "2024-02-01T10:30:00Z",
      "sampleQuantity": 2
    }
  ]
}
```

## Error Responses

All endpoints may return these error responses:

```http
401 Unauthorized:
{
  "error": "Authentication required"
}

403 Forbidden:
{
  "error": "Insufficient permissions"
}

404 Not Found:
{
  "error": "Resource not found"
}

422 Validation Error:
{
  "error": "Validation failed",
  "details": {
    "field": ["error message"]
  }
}

500 Server Error:
{
  "error": "Internal server error"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. Headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```