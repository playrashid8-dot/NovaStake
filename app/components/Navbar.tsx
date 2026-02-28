"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    checkIfConnected()
  }, [])

  async function checkIfConnected() {
    if (!(window as any).ethereum) return

    const accounts = await (window as any).ethereum.request({
      method: "eth_accounts",
    })

    if (accounts.length > 0) {
      setAccount(accounts[0])
    }
  }

  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("Install MetaMask")
      return
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    })

    setAccount(accounts[0])

    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 300)
  }

  function shortAddress(addr: string) {
    return addr.slice(0, 6) + "..." + addr.slice(-4)
  }

  return (
    <div style={styles.nav}>
      <h2 style={styles.logo}>NovaDeFi</h2>

      {account ? (
        <div style={styles.wallet}>
          {shortAddress(account)}
        </div>
      ) : (
        <button onClick={connectWallet} style={styles.connectBtn}>
          Connect Wallet
        </button>
      )}
    </div>
  )
}

const styles: any = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
  },
  connectBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: "#3b82f6",
    color: "white",
    fontWeight: 600,
  },
  wallet: {
    padding: "10px 16px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.1)",
    fontWeight: 600,
  },
}