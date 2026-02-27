"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../lib/contract";
import BottomNav from "./components/BottomNav";

declare global {
  interface Window {
    ethereum?: any;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [pendingReward, setPendingReward] = useState("0");
  const [totalDeposit, setTotalDeposit] = useState("0");
  const [totalWithdrawn, setTotalWithdrawn] = useState("0");
  const [referralCount, setReferralCount] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");

  const usdtAddress = "0x751827905A4E0BDaB0DEFFd7bDc8eDdcFEec5018";

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }
    if (!window.ethereum) {
  alert("Install MetaMask");
  return;
}

const connectWallet = async () => {
  if (typeof window === "undefined") return;

  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  const provider = new ethers.providers.Web3Provider(
    window.ethereum as any
  );

  const accounts = await provider.send("eth_requestAccounts", []);
  setWallet(accounts[0]);
};

  const loadUserData = async () => {
    if (!wallet) return;
    try {
      const contract = await getContract();
      if (!contract) return;

      const data = await contract.users(wallet);
      setUserData(data);

      setTotalDeposit(ethers.utils.formatUnits(data.deposit, 18));
      setTotalWithdrawn(ethers.utils.formatUnits(data.totalWithdrawn, 18));

      const reward = await contract.calculateReward(wallet);
      setPendingReward(ethers.utils.formatUnits(reward, 18));

      const count = await contract.getReferrals(wallet);
      setReferralCount(count.toString());

      const usdtAddr = await contract.usdt();
      const usdtContract = new ethers.Contract(
        usdtAddr,
        ["function balanceOf(address) view returns(uint256)"],
        contract.provider
      );

      const balance = await usdtContract.balanceOf(contract.address);
      setContractBalance(ethers.utils.formatUnits(balance, 18));

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (wallet) loadUserData();
  }, [wallet]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && ethers.utils.isAddress(ref)) {
        setReferrer(ref);
      }
    }
  }, []);

  const deposit = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      const finalReferrer = referrer || wallet;

      const usdt = new ethers.Contract(
        usdtAddress,
        ["function approve(address spender,uint256 amount) public returns(bool)"],
        contract.signer
      );

      await (await usdt.approve(contract.address, parsedAmount)).wait();
      await (await contract.deposit(parsedAmount, finalReferrer)).wait();

      alert("Deposit Successful 🚀");
      setAmount("");
      loadUserData();
    } catch {
      alert("Deposit Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      await (await contract.withdraw()).wait();
      alert("Withdraw Successful 💰");
      loadUserData();
    } catch {
      alert("Withdraw Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <div style={styles.nav}>
        <div style={styles.logo}>🚀 NovaDeFi</div>

        {!wallet ? (
          <button
  style={styles.depositBtn}
  onMouseEnter={(e) =>
    (e.currentTarget.style.boxShadow =
      "0 0 30px rgba(34,197,94,0.9)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.boxShadow =
      "0 0 15px rgba(34,197,94,0.5)")
  }
>
            Connect Wallet
          </button>
        ) : (
          <div style={styles.wallet}>
            {wallet.slice(0,6)}...{wallet.slice(-4)}
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div style={styles.mainGrid}>

        {/* Stats */}
        <div style={styles.statsSection}>
          <Stat title="Total Deposit" value={totalDeposit + " USDT"} />
          <Stat title="Pending ROI" value={pendingReward + " USDT"} />
          <Stat title="Total Withdrawn" value={totalWithdrawn + " USDT"} />
          <Stat title="Referrals" value={referralCount} />
          <Stat title="Contract Balance" value={contractBalance + " USDT"} />
          <Stat title="Level" value={userData?.level?.toString() || "0"} />
        </div>

        {/* Action Panel */}
        {wallet && (
          <div style={styles.actionCard}>
            <h3 style={{ marginBottom: 20 }}>Deposit & Withdraw</h3>

            <input
              type="number"
              placeholder="Enter USDT amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
            />

            <div style={styles.buttonRow}>
              <button style={styles.depositBtn} onClick={deposit} disabled={loading}>
                Deposit
              </button>

              <button style={styles.withdrawBtn} onClick={withdraw} disabled={loading}>
                Withdraw
              </button>
            </div>

            <div style={{ marginTop: 25 }}>
              <p style={{ fontSize: 13, opacity: 0.7 }}>Referral Link</p>
              <input
                readOnly
                value={
                  (typeof window !== "undefined"
                    ? window.location.origin
                    : "") + "?ref=" + wallet
                }
                style={styles.input}
              />
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div style={styles.featureSection}>
          <div style={styles.featureCard}>👥 Team</div><div
  style={styles.featureCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  }}
>
  👥 Team
</div>
          <div style={styles.featureCard}>🎁 Rewards</div><div
  style={styles.featureCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  }}
>
  👥 Team
</div>
          <div style={styles.featureCard}>💎 NFT</div><div
  style={styles.featureCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  }}
>
  👥 Team
</div>
          <div style={styles.featureCard}>👑 VIP</div><div
  style={styles.featureCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  }}
>
  👥 Team
</div>
          <div style={styles.featureCard}>📊 Analytics</div><div
  style={styles.featureCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  }}
>
  👥 Team
</div>
          <div style={styles.featureCard}>⚙ Settings</div><div
  style={styles.featureCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  }}
>
  👥 Team
</div>
        </div>

      </div>

      {/* Fixed Bottom Navigation */}
      <div style={styles.bottomNav}>
        <div
  style={styles.navItem}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#38bdf8";
    e.currentTarget.style.transform = "scale(1.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "#94a3b8";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🏠
</div>
        <div style={styles.navItem}>👥</div><div
  style={styles.navItem}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#38bdf8";
    e.currentTarget.style.transform = "scale(1.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "#94a3b8";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🏠
</div>
        <div style={styles.navItem}>💎</div><div
  style={styles.navItem}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#38bdf8";
    e.currentTarget.style.transform = "scale(1.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "#94a3b8";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🏠
</div>
        <div style={styles.navItem}>👑</div><div
  style={styles.navItem}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#38bdf8";
    e.currentTarget.style.transform = "scale(1.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "#94a3b8";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🏠
</div>
        <div style={styles.navItem}>⚙</div><div
  style={styles.navItem}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#38bdf8";
    e.currentTarget.style.transform = "scale(1.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "#94a3b8";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  🏠
</div>
      </div>

    </div>
  );
}
}
function Stat({ title, value }: any) {
  return (
    <div style={styles.statCard}>
      <p style={{ opacity: 0.6 }}>{title}</p>
      <h3 style={{ marginTop: 10 }}>{value}</h3>
    </div>
  );
}

const styles: any = {

  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    padding: 30,
    paddingBottom: 120,
    color: "#fff",
    fontFamily: "Inter, sans-serif"
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40
  },

  logo: { fontSize: 22, fontWeight: "bold" },

  wallet: {
    background: "#1e293b",
    padding: "8px 16px",
    borderRadius: 12
  },

  connectBtn: {
    background: "#2563eb",
    border: "none",
    padding: "10px 18px",
    borderRadius: 12,
    color: "#fff",
    cursor: "pointer"
  },

  mainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 30
  },

  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 20
  },

  statCard: {
  background: "rgba(30,41,59,0.85)",
  padding: 20,
  borderRadius: 16,
  backdropFilter: "blur(12px)",
  transition: "all 0.3s ease",
  boxShadow: "0 0 15px rgba(0,0,0,0.3)"
},

  actionCard: {
    background: "rgba(30,41,59,0.95)",
    padding: 25,
    borderRadius: 16
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    marginBottom: 15
  },

  buttonRow: { display: "flex", gap: 10 },

  depositBtn: {
  flex: 1,
  background: "linear-gradient(135deg,#16a34a,#22c55e)",
  border: "none",
  padding: 12,
  borderRadius: 12,
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 0 15px rgba(34,197,94,0.5)"
},

  withdrawBtn: {
  flex: 1,
  background: "linear-gradient(135deg,#dc2626,#ef4444)",
  border: "none",
  padding: 12,
  borderRadius: 12,
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 0 15px rgba(239,68,68,0.5)"
},

  featureSection: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 15
  },

  featureCard: {
  background: "rgba(30,41,59,0.8)",
  padding: 18,
  borderRadius: 14,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 0 15px rgba(0,0,0,0.3)"
},

  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    background: "#0f172a",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid #1e293b"
  },

  navItem: {
  fontSize: 22,
  cursor: "pointer",
  transition: "all 0.3s ease",
  color: "#94a3b8"
},
);
}