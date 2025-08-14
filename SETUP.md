# Click Attack Game Setup

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Wallet Configuration for Contract Interaction
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Features

- 🎮 **Button Clicking Game**: 30-second timer, click as fast as you can!
- 🔗 **Privy Integration**: Connect wallet to submit scores
- ⛓️ **Smart Contract**: Submits scores to Monad Testnet
- 📊 **Score Tracking**: Real-time score and performance metrics

## Game Flow

1. Connect your wallet using Privy
2. Start a 30-second clicking game
3. Click the button as many times as possible
4. Submit your final score to the blockchain
5. View transaction confirmation

## Contract Details

- **Address**: `0xceCBFF203C8B6044F52CE23D914A1bfD997541A4`
- **Network**: Monad Testnet
- **Function**: `updatePlayerData(address player, uint256 scoreAmount, uint256 transactionAmount)`

## Run the App

```bash
npm run dev
```

Then visit `http://localhost:3000` to play!
