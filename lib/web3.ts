"use client";

/* =========================================
🔥 CONTRACT ADDRESSES (BSC MAINNET)
========================================= */

export const NOVADEFI_ADDRESS =
"0x6ea27b4cE7084B8A31c1c47743f23739872987b5";

export const USDT_ADDRESS =
"0x55d398326f99059fF775485246999027B3197955";

/* =========================================
📜 NOVADEFI ABI (FULL VERIFIED ABI)
========================================= */

export const NOVADEFI_ABI = [
{
"inputs":[
{"internalType":"address","name":"_usdt","type":"address"},
{"internalType":"address","name":"_treasury","type":"address"}
],
"stateMutability":"nonpayable",
"type":"constructor"
},

{
"anonymous":false,
"inputs":[
{"indexed":true,"internalType":"address","name":"user","type":"address"},
{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}
],
"name":"Deposited",
"type":"event"
},
{
"anonymous":false,
"inputs":[
{"indexed":true,"internalType":"address","name":"user","type":"address"},
{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}
],
"name":"WithdrawRequested",
"type":"event"
},
{
"anonymous":false,
"inputs":[
{"indexed":true,"internalType":"address","name":"user","type":"address"},
{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},
{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}
],
"name":"Withdrawn",
"type":"event"
},
{
"anonymous":false,
"inputs":[
{"indexed":true,"internalType":"address","name":"user","type":"address"},
{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},
{"indexed":false,"internalType":"uint256","name":"daysPeriod","type":"uint256"}
],
"name":"Staked",
"type":"event"
},
{
"anonymous":false,
"inputs":[
{"indexed":true,"internalType":"address","name":"user","type":"address"},
{"indexed":false,"internalType":"uint256","name":"total","type":"uint256"}
],
"name":"StakeClaimed",
"type":"event"
},

/* ===== WRITE FUNCTIONS ===== */

{
"name":"deposit",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[
{"name":"amount","type":"uint256"},
{"name":"referrer","type":"address"}
],
"outputs":[]
},
{
"name":"requestWithdraw",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[{"name":"amount","type":"uint256"}],
"outputs":[]
},
{
"name":"claimWithdraw",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[],
"outputs":[]
},
{
"name":"cancelWithdraw",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[],
"outputs":[]
},
{
"name":"createStake",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[
{"name":"amount","type":"uint256"},
{"name":"daysPeriod","type":"uint256"}
],
"outputs":[]
},
{
"name":"claimStake",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[{"name":"index","type":"uint256"}],
"outputs":[]
},
{
"name":"claimSalary",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[],
"outputs":[]
},

/* ===== VIEW FUNCTIONS ===== */

{
"name":"users",
"type":"function",
"stateMutability":"view",
"inputs":[{"name":"","type":"address"}],
"outputs":[
{"name":"depositBalance","type":"uint256"},
{"name":"rewardBalance","type":"uint256"},
{"name":"lastROIUpdate","type":"uint256"},
{"name":"lastWithdrawRequest","type":"uint256"},
{"name":"pendingWithdraw","type":"uint256"},
{"name":"monthlyWithdrawn","type":"uint256"},
{"name":"monthStart","type":"uint256"},
{"name":"level","type":"uint8"},
{"name":"referrer","type":"address"},
{"name":"directCount","type":"uint256"},
{"name":"teamCount","type":"uint256"},
{"name":"salaryStage","type":"uint8"},
{"name":"levelBonusStage","type":"uint8"}
]
},
{
"name":"ADMIN_FEE",
"type":"function",
"stateMutability":"view",
"inputs":[],
"outputs":[{"type":"uint256"}]
},
{
"name":"MIN_DEPOSIT",
"type":"function",
"stateMutability":"view",
"inputs":[],
"outputs":[{"type":"uint256"}]
},
{
"name":"MIN_WITHDRAW",
"type":"function",
"stateMutability":"view",
"inputs":[],
"outputs":[{"type":"uint256"}]
},
{
"name":"WITHDRAW_COOLDOWN",
"type":"function",
"stateMutability":"view",
"inputs":[],
"outputs":[{"type":"uint256"}]
},
{
"name":"treasury",
"type":"function",
"stateMutability":"view",
"inputs":[],
"outputs":[{"type":"address"}]
}
];

/* =========================================
💵 ERC20 ABI (USDT)
========================================= */

export const ERC20_ABI = [
{
"name":"approve",
"type":"function",
"stateMutability":"nonpayable",
"inputs":[
{"name":"spender","type":"address"},
{"name":"amount","type":"uint256"}
],
"outputs":[{"type":"bool"}]
},
{
"name":"allowance",
"type":"function",
"stateMutability":"view",
"inputs":[
{"name":"owner","type":"address"},
{"name":"spender","type":"address"}
],
"outputs":[{"type":"uint256"}]
},
{
"name":"balanceOf",
"type":"function",
"stateMutability":"view",
"inputs":[{"name":"account","type":"address"}],
"outputs":[{"type":"uint256"}]
}
];