# Inventory System - Module 2 (Operator Web App)

## Overview
This is Module 2 of the modular inventory management system - a Next.js Progressive Web App (PWA) designed for inventory operators.

## Purpose
- **Mobile-First Interface**: Optimized for operators on tablets and phones
- **Offline Capabilities**: Works without internet using IndexedDB queue
- **Real-Time Operations**: Receive, process, and dispatch inventory
- **PWA Features**: Installable app with service worker caching

## Features
- **PIN Authentication**: Secure 8-hour sessions (default PIN: 2580)
- **Storage (Receive)**: Add inventory to storage with cost tracking
- **Processing**: Transfer between locations and execute production batches
- **Exit (Dispatch)**: Ship finished goods with sales price tracking
- **Stock Monitoring**: Real-time inventory levels by location with search
- **History**: Transaction log with filtering and CSV export
- **Offline Queue**: Automatic sync when connection restored

## Stock Page
The `/stock` route provides real-time inventory monitoring:
- **Data Source**: Queries `stock_by_location` view from Module 1
- **Columns**: Item name, unit, Storage qty, Processing qty, Exit qty, Total
- **Features**: Refresh button, empty state handling, error recovery
- **Real-time**: Shows current inventory levels across all locations

To populate stock data:
1. Use Storage page to receive raw materials
2. Use Processing → Transfer to move items between locations
3. Use Processing → Produce Batch to create finished goods
4. Stock levels update automatically after each transaction

## Item Management
Unified item reads across all pages:
- **Storage Page**: Queries `items` table with `type='raw'` and `active=true`
- **Exit Page**: Queries `items` table with `type='finished'` and `active=true`
- **Helper Function**: `getItems({ type, activeOnly })` in `src/lib/db.ts`
- **Feature Flag**: `NEXT_PUBLIC_USE_DB_ITEMS=true` enables database items

## Technical Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with green/gold theme
- **Backend**: Supabase integration (Module 1)
- **Offline**: IndexedDB with automatic sync
- **PWA**: Service worker, manifest, installable

## Files Structure
```
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── login/            # PIN authentication
│   │   ├── home/             # Dashboard with navigation
│   │   ├── storage/          # Inventory receiving
│   │   ├── processing/       # Transfer and production
│   │   ├── exit/             # Goods dispatch
│   │   ├── stock/            # Inventory monitoring
│   │   └── history/          # Transaction history
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Services and utilities
│   │   └── db.ts             # Unified item queries
│   └── public/               # PWA assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Configure Supabase credentials
4. Start development: `npm run dev`
5. Access at: http://localhost:3000

## Environment Variables
Copy `.env.example` to `.env.local` and configure:
- Supabase project URL and anon key
- Default PIN for authentication
- Feature flag: `NEXT_PUBLIC_USE_DB_ITEMS=true` (enables database items)

**⚠️ Never commit `.env.local` files to version control!**

## Smoke Test Steps
1. **Login**: Enter PIN (default: 2580)
2. **Storage**: Receive raw materials (requires items with type='raw' in database)
3. **Stock**: Verify received items appear in Storage column
4. **Processing → Transfer**: Move items from Storage to Processing
5. **Stock**: Verify items moved to Processing column
6. **Processing → Produce**: Create finished goods from raw materials
7. **Stock**: Verify finished goods appear in Processing/Exit columns
8. **Exit**: Dispatch finished goods (requires items with type='finished')
9. **Stock**: Verify dispatched quantities reduced
10. **History**: Review all transactions with filtering

## PWA Installation
- Open in Chrome/Edge on mobile device
- Look for "Install App" prompt or "Add to Home Screen"
- Works offline after installation
- Automatic updates when online

## Integration
Connects to **Module 1** (Supabase Backend) for:
- Item management and recipes
- Inventory transactions via RPC functions
- Real-time stock levels and history
- User authentication and security

## Offline Capabilities
- Queues transactions when offline
- Automatic sync when connection restored
- Deduplication prevents double-entries
- Visual indicators for sync status

## Support
Production-ready operator interface with comprehensive offline support and mobile optimization.
