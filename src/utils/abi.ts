export const CONTRACT_ABI = [
  {
    inputs: [
      { name: "player", type: "address" },
      { name: "scoreAmount", type: "uint256" },
      { name: "transactionAmount", type: "uint256" },
    ],
    name: "updatePlayerData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
