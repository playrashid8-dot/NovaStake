"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaUsers, FaGem, FaCrown, FaCog } from "react-icons/fa";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: <FaHome />, path: "/" },
    { icon: <FaUsers />, path: "/team" },
    { icon: <FaGem />, path: "/nft" },
    { icon: <FaCrown />, path: "/vip" },
    { icon: <FaCog />, path: "/settings" },
  ];

  return (
    <div style={styles.bottomNav}>
      {navItems.map((item, index) => {
        const active = pathname === item.path;
        return (
          <div
            key={index}
            onClick={() => router.push(item.path)}
            style={{
              ...styles.navItem,
              color: active ? "#38bdf8" : "#94a3b8",
              transform: active ? "scale(1.2)" : "scale(1)",
            }}
          >
            {item.icon}
          </div>
        );
      })}
    </div>
  );
}

const styles: any = {
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
    borderTop: "1px solid #1e293b",
    backdropFilter: "blur(12px)",
    zIndex: 999,
  },

  navItem: {
    fontSize: 22,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};