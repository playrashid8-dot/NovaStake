"use client"

export default function StatsGrid() {
  const stats = [
    { title: "Total Deposit", value: "0 USDT" },
    { title: "Pending ROI", value: "0 USDT" },
    { title: "Total Withdrawn", value: "0 USDT" },
    { title: "Available Balance", value: "0 USDT" },
    { title: "Direct Referrals", value: "0" },
    { title: "Total Team", value: "0" },
    { title: "Current Level", value: "0" },
    { title: "Salary Earned", value: "0 USDT" },
    { title: "Active Staking", value: "0 USDT" },
    { title: "ROI Cap Remaining", value: "0 USDT" },
    { title: "Lock Status", value: "Inactive" },
    { title: "Contract Balance", value: "0 USDT" },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {stats.map((item, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-purple-500/20 hover:scale-105 transition duration-300"
        >
          <p className="text-gray-300 text-sm">{item.title}</p>
          <h3 className="text-2xl font-bold mt-3 text-white">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  )
}