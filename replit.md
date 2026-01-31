# Just Check Market

## Overview

A real-time market price tracker that displays cryptocurrency, gold/coins, and currency exchange rates. The application fetches live price data from external APIs (Baha24 and Nobitex) and presents it in a modern, responsive dashboard with automatic refresh capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with automatic caching and refetching
- **Styling**: Tailwind CSS with custom dark theme, using CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and card animations
- **Charts**: Recharts for rendering price visualization charts

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Server**: Node.js HTTP server running on port 5000
- **API Design**: RESTful API endpoints defined in `shared/routes.ts` for type-safe client-server communication
- **Development**: Vite middleware integration for hot module replacement during development
- **Production**: Static file serving from compiled `dist/public` directory

### Data Flow
1. Backend fetches prices from Baha24 API with timeout handling
2. Prices are cached in memory with 5-minute TTL to reduce API calls
3. Frontend polls `/api/prices` endpoint every 5 minutes for updates
4. Data is categorized into crypto, gold, and currencies based on symbol matching
5. Test Plan (Beta) section uses `/api/nobitex` endpoint with 1-minute refresh for BTC, XRP, TRX prices in Toman

### Recent Changes (Jan 2026)
- Added "Test Plan (Beta)" section with 24-hour price charts for Bitcoin, XRP, and Tron
- Converted all prices to display in "Toman" format
- Added English name translations for all Persian labels
- Redesigned gold chart with progress bars and statistics
- USDT now displayed prominently as first item in crypto section
- AZADI coin symbols formatted with parentheses notation (e.g., AZADI (1), AZADI (1/2))

### Build System
- Custom build script (`script/build.ts`) using esbuild for server bundling and Vite for client
- Server dependencies are selectively bundled to optimize cold start times
- Path aliases configured: `@/` for client source, `@shared/` for shared types

### Database Configuration
- Drizzle ORM configured with PostgreSQL dialect
- Schema defined in `shared/schema.ts`
- Currently uses in-memory storage (`MemStorage`) for price caching
- Database connection requires `DATABASE_URL` environment variable when using Drizzle

## External Dependencies

### External APIs
- **Baha24 API** (`https://baha24.com/api/v1/price`): Primary source for cryptocurrency, gold, and currency prices
- **Nobitex API**: Secondary source for cryptocurrency orderbook data and trades

### Third-Party Services
- **Google Fonts**: Space Grotesk and Inter fonts loaded via CDN

### Key NPM Packages
- `@tanstack/react-query`: Data fetching and caching
- `recharts`: Chart visualization
- `framer-motion`: Animations
- `drizzle-orm` + `drizzle-zod`: Database ORM and schema validation
- `zod`: Runtime type validation for API responses
- Radix UI primitives: Accessible UI component foundations