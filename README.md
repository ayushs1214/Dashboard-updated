# Milagro Admin Dashboard

A comprehensive admin dashboard for managing products, inventory, orders, and user interactions in the Milagro ecosystem. Built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication & Authorization
- Role-based access control (Superadmin, Admin, Dealer, Architect, Builder)
- Granular permission system
- Secure authentication with Supabase
- Activity logging and audit trails

### User Management
- User registration approval system
- Role-specific permissions
- Dealer/Salesperson management (requires Superadmin approval)
- Assigned user management for admins
- Real-time user activity tracking

### Product Management
- Comprehensive product catalog with:
  - Series name and product name
  - Finish options (Glossy/Matt/Satin/Pro-Surface)
  - Cost price (Superadmin only)
  - Application types (Wall/Floor/Exterior Facade/Bathroom/Kitchen-top/Dado/Frame)
  - Categories (Slabs/Subways/GVT/Ceramic)
  - Box packing and MOQ in boxes
  - Product weight and thickness
  - Number of faces
  - Logo presence indicator
  - Panel size in multiple units
- Real-time inventory tracking
- Bulk product uploads
- Sample product management

### Order Management
- Real-time order processing
- PO number tracking
- Special discounts (percentage/amount/per box)
- Out-of-stock order handling (15-day delivery)
- Inquiry and negotiation tracking
- Payment management
- Delivery tracking

### Sample Management
- Comprehensive status flow:
  - Order received
  - Design
  - Dealer approval
  - Printing
  - Warehouse
  - Ready for dispatch
  - Dispatched
  - Delivered
- Sample tracking
- Conversion analytics

### Expo Management
- Exhibition and event management
- Product showcase with:
  - Name
  - Color
  - Type
  - Size
- Participant registration
- Real-time analytics

### Analytics & Reporting
- Revenue Analysis:
  - Dealer-wise revenue
  - Salesperson performance
  - Item group revenue
  - Area-wise revenue (T1/T2)
  - Cross-analysis matrices
- Performance Tracking:
  - No orders (30 days)
  - Sample conversion tracking
  - Slow-moving items
  - Cost analysis (Superadmin only)

## Tech Stack

### Frontend
- React 18.x
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Recharts (Charts)
- Zustand (State Management)

### Backend
- Supabase
  - Authentication
  - Real-time Database
  - Storage
  - Row Level Security
  - Edge Functions
  - Webhooks

### Development Tools
- Vite
- ESLint
- PostCSS
- Autoprefixer

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/milagro-admin.git
cd milagro-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|-----------|
| VITE_SUPABASE_URL | Your Supabase project URL | Yes |
| VITE_SUPABASE_ANON_KEY | Your Supabase anonymous key | Yes |
| VITE_RESEND_API_KEY | Resend API key for emails | Yes |
| VITE_API_URL | API base URL | Yes |
| VITE_API_TIMEOUT | API timeout in milliseconds | No |
| VITE_ENABLE_NOTIFICATIONS | Enable notifications feature | No |
| VITE_ENABLE_ANALYTICS | Enable analytics feature | No |
| VITE_ENVIRONMENT | Development environment | No |
| VITE_APP_URL | Application URL | No |

## Role-Based Access

### Superadmin
- Full system access
- Product cost visibility
- Dealer approval authority
- User assignment management
- System configuration
- Advanced analytics access

### Admin
- Limited to assigned users
- No product cost visibility
- Basic user management
- Order processing
- Sample management

### Dealer
- Product catalog access
- Order management
- Sample requests
- Basic analytics

### Architect/Builder
- Product catalog access
- Sample management
- Project tracking

## CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Continuous Integration (CI)
  - Code linting
  - Type checking
  - Unit tests
  - Security scanning
- Continuous Deployment (CD)
  - Automatic deployment to Netlify
  - Environment variable management
  - Build optimization

## Security Features

- JWT-based authentication
- Role-based access control
- Row Level Security
- Secure password handling
- XSS protection
- CORS configuration
- Rate limiting
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.#   D a s h b o a r d - u p d a t e d  
 