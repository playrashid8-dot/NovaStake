export const NOVA_AIRDROP_ADDRESS =
  "0x98762f38Eb0Fce778e6a70812c71a1F3Be7C56b3" as const;

export const NOVA_AIRDROP_ABI = [
  {
    name: "claimAirdrop",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "completeTelegramTask",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "completeWhatsappTask",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getUserAirdropBreakdown",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "walletReward", type: "uint256" },
      { name: "telegramReward", type: "uint256" },
      { name: "whatsappReward", type: "uint256" },
      { name: "stakeReward", type: "uint256" },
      { name: "referralReward", type: "uint256" },
      { name: "presaleReward", type: "uint256" },
      { name: "manualReward", type: "uint256" },
      { name: "totalEarned", type: "uint256" },
      { name: "totalClaimed", type: "uint256" },
      { name: "claimableNow", type: "uint256" },
    ],
  },
  {
    name: "getTaskStatus",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "telegramDone", type: "bool" },
      { name: "whatsappDone", type: "bool" },
    ],
  },
  {
    name: "remainingAirdropPool",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const TELEGRAM_URL = "https://t.me/NovaStakeofficial";
export const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb7d1OW1t90cl4jcNr3M";