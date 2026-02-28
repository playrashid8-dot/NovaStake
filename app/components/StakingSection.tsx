"use client"

export default function StakingSection() {
  const plans = [
    { name: "30 Days", min: 100, daily: "1.6%" },
    { name: "60 Days", min: 500, daily: "2.1%" },
    { name: "90 Days", min: 2000, daily: "2.5%" },
  ]

  return (
    <div style={styles.grid}>
      {plans.map((plan, i) => (
        <div key={i} style={styles.card}>
          <h3>{plan.name}</h3>
          <p>Min: {plan.min} USDT</p>
          <p>Daily: {plan.daily}</p>
          <button style={styles.btn}>Stake</button>
        </div>
      ))}
    </div>
  )
}

const styles: any = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 40,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 12,
  },
  btn: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
  },
}