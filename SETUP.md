# Click Attack Game Setup

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

```

## Features

- 🎮 **Button Clicking Game**: 30-second timer, click as fast as you can!
- 🔗 **Privy Integration**: Connect wallet to submit scores
- ⛓️ **Smart Contract**: Submits scores to Monad Testnet
- 📊 **Score Tracking**: Real-time score and performance metrics

## Game Flow

1. Login via email with privy Monad Games ID
2. Slash/Slice Monanimals to earn points
3. Submit your final score to the blockchain
4. View transaction confirmation

##

--Add sound on start, bomb, slice, combo,
--fix game over modal

## Contract Details

- **Contract Address**: `0xceCBFF203C8B6044F52CE23D914A1bfD997541A4`
- **Network**: Monad Testnet
- **Function**: `updatePlayerData(address player, uint256 scoreAmount, uint256 transactionAmount)`

## Run the App

```bash
npm run dev
```

Then visit `http://localhost:3000` to play!
