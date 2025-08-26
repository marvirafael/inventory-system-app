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
- **Stock Monitoring**: Real-time inventory levels and search
- **History**: Transaction log with filtering and CSV export
- **Offline Queue**: Automatic sync when connection restored

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
- Optional feature flags

**⚠️ Never commit `.env.local` files to version control!**

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
