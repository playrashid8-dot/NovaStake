import { ethers } from "ethers"

export async function connectWallet() {
  if (typeof window === "undefined") return null

  const { ethereum } = window as any

  if (!ethereum) {
    alert("Install MetaMask")
    return null
  }

  await ethereum.request({
    method: "eth_requestAccounts",
  })

  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()

  return await signer.getAddress()
}