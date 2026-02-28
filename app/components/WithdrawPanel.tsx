"use client"

export default function WithdrawPanel() {
  return (
    <div style={styles.card}>
      <h3>Withdraw</h3>

      <p>Available: 0 USDT</p>
      <p>Daily Limit: 500 USDT</p>

      <input
        type="number"
        placeholder="Enter amount"
        style={styles.input}
      />

      <button style={styles.btnRed}>Request Withdraw</button>

      <div style={{ marginTop: 15 }}>
        <p>Pending: 0 USDT</p>
        <p>Releases in: 00h 00m</p>
      </div>
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
    marginTop: 10,
    borderRadius: 8,
    border: "none",
  },
  btnRed: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
  },
}