"use client"

import { useState } from "react"

export default function DepositPanel() {
  const [amount, setAmount] = useState("")

  return (
    <div style={styles.card}>
      <h3>Deposit</h3>

      <input
        type="number"
        placeholder="Enter USDT amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <button style={styles.btn}>Approve</button>
      <button style={styles.btnGreen}>Deposit</button>

      <p style={styles.notice}>
        Min deposit: 50 USDT | Self bonus: 3%
      </p>
    </div>
  )
}

const styles: any = {
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    border: "none",
  },
  btn: {
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  btnGreen: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#16a34a",
    color: "white",
    cursor: "pointer",
  },
  notice: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.7,
  },
}