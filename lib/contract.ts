import { ethers } from "ethers";

export const contractAddress = "0x013B091E9c048964854E3AEcb4A3324Fdc45672f";

export const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdt", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint256", name: "deposit", type: "uint256" },
      { internalType: "uint256", name: "depositTime", type: "uint256" },
      { internalType: "uint256", name: "lastWithdrawTime", type: "uint256" },
      { internalType: "uint256", name: "totalWithdrawn", type: "uint256" },
      { internalType: "uint256", name: "level", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export async function getContract() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return null;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI, signer);
}