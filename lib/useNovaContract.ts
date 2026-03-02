"use client";

import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
} from "./web3";

export function useNovaContract() {
  const { data: walletClient } = useWalletClient();

  if (!walletClient) return null;

  const provider = new ethers.providers.Web3Provider(
    walletClient.transport
  );

  const signer = provider.getSigner();

  return new ethers.Contract(
    NOVADEFI_ADDRESS,
    NOVADEFI_ABI,
    signer
  );
}