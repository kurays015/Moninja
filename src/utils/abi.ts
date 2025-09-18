export const OLD_ABI = [
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

export const UPDATE_PLAYER_DATA_ABI = [
  {
    name: "updatePlayerData",
    type: "function",
    inputs: [
      {
        name: "_playerData",
        type: "tuple",
        components: [
          { name: "player", type: "address" },
          { name: "score", type: "uint256" },
          { name: "transactions", type: "uint256" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

// {
//   name: "updatePlayerData",
//   type: "function",
//   inputs: [
//     {
//       name: "_playerData",
//       type: "tuple",
//       components: [
//         { name: "player", type: "address" },
//         { name: "score", type: "uint256" },
//         { name: "transactions", type: "uint256" },
//       ],
//     },
//   ],
//   outputs: [],
//   stateMutability: "nonpayable",
// },
