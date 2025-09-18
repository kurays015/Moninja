# Moninja Game

A fun fruit-slicing game built with Next.js, React, and TanStack Query.

## Features

- **TanStack Query Integration**: Modern data fetching with automatic caching, background updates, and error handling
- **Axios API Client**: Centralized API management with interceptors and type safety
- **Real-time Gameplay**: Smooth animations and responsive controls
- **Score Tracking**: Persistent score system with blockchain integration
- **Authentication**: Privy wallet integration for secure gameplay

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Data Fetching**: TanStack Query v5 with Axios
- **Authentication**: Privy
- **Styling**: Tailwind CSS
- **Audio**: Custom audio manager with Web Audio API

## API Integration

The game uses TanStack Query for all data operations:

### Hooks

- `useUsername`: Fetches and caches player username
- `usePlayerTotalScore`: Manages player's total score across sessions
- `useGameSession`: Handles game session lifecycle (start, end, score submission)

### Features

- **Automatic Caching**: Queries are cached for 5 minutes with 10-minute garbage collection
- **Background Updates**: Data refreshes automatically when needed
- **Error Handling**: Built-in retry logic and error states
- **Optimistic Updates**: Immediate UI updates with background sync
- **Query Invalidation**: Automatic cache invalidation when data changes

### Configuration

- **Stale Time**: 5 minutes (data considered fresh)
- **GC Time**: 10 minutes (how long to keep unused data)
- **Retry**: 1 attempt on failure
- **Refetch on Focus**: Disabled for better UX

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   NEXT_PUBLIC_MON_ID=your_mon_id
   CONTRACT_ADDRESS=your_contract_address
   JWT_SECRET=your_jwt_secret
   GAME_ADDRESS=your_game_address
   ARCJET_KEY=your_arcjet_key
   PRIVATE_RPC=your_private_rpc
   MONAD_CLIP_BASE_URL=monad_clip_base_url
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Game Mechanics

- Slash fruits to earn points
- Avoid bombs - they end the game
- Special monad objects require multiple slashes
- Frenzy mode activates at score milestones
- Combo system for multiple simultaneous hits

## Performance Features

- **Query Deduplication**: Multiple components can use the same data without duplicate requests
- **Background Refetching**: Data stays fresh without blocking the UI
- **Smart Caching**: Only fetches data when needed
- **Optimistic Updates**: Immediate feedback for better user experience
