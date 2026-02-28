import { ethers } from "ethers";

export const CONTRACT_ADDRESS =
  "0x5c201cef85678d7b12001c675afe51aa2eDac6CC";

export const USDT_ADDRESS =
  "0x751827905A4E0BDaB0DEFFd7bDc8eDdcFEec5018";

export const CONTRACT_ABI = [
  "function deposit(uint256 amount) public",
  "function requestWithdraw(uint256 amount) public",
  "function claimWithdraw() public",
  "function getUser(address user) public view returns (uint256,uint256,uint256)",
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function allowance(address owner, address spender) public view returns (uint256)",
];

export async function getProvider() {
  if (!(window as any).ethereum) throw new Error("MetaMask not found");
  return new ethers.providers.Web3Provider((window as any).ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getContract() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function getUSDT() {
  const signer = await getSigner();
  return new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
}