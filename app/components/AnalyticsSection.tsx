"use client"

export default function AnalyticsSection() {
  return (
    <div style={styles.card}>
      <h3>Analytics</h3>
      <p>Deposit History</p>
      <p>Withdrawal History</p>
      <p>Salary History</p>
      <p>Staking History</p>
    </div>
  )
}

const styles: any = {
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 12,
  },
}