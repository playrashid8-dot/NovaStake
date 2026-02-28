"use client"

export default function TeamSection() {
  return (
    <div style={styles.card}>
      <h3>Team Overview</h3>

      <p>Direct: 0</p>
      <p>Total Team: 0</p>

      <p style={{ marginTop: 10 }}>Salary Progress</p>
      <div style={styles.progressBar}>
        <div style={styles.progress}></div>
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
  progressBar: {
    height: 10,
    background: "#1e293b",
    borderRadius: 6,
  },
  progress: {
    height: 10,
    width: "40%",
    background: "#16a34a",
    borderRadius: 6,
  },
}