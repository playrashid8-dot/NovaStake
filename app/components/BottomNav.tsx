"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  HandCoins,
  Lock,
  WalletCards,
  Users,
  BadgeDollarSign,
  Ticket,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <Home size={18} /> },
  { key: "stake", label: "Stake", icon: <HandCoins size={18} /> },
  { key: "staking", label: "Staking", icon: <Lock size={18} /> },
  { key: "rewards", label: "Rewards", icon: <WalletCards size={18} /> },
  { key: "team", label: "Team", icon: <Users size={18} /> },
  { key: "salary", label: "Salary", icon: <BadgeDollarSign size={18} /> },
  { key: "presale", label: "Presale", icon: <Ticket size={18} /> },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

const VALID_KEYS: ReadonlySet<NavKey> = new Set(
  NAV_ITEMS.map((item) => item.key)
) as ReadonlySet<NavKey>;

export default function BottomNav() {
  const router = useRouter();
  const params = useSearchParams();

  const activeTab = useMemo<NavKey>(() => {
    const tab = params.get("tab");
    if (tab && VALID_KEYS.has(tab as NavKey)) {
      return tab as NavKey;
    }
    return "home";
  }, [params]);

  function goTo(tabName: NavKey) {
    if (tabName === "home") {
      router.push("/dashboard");
      return;
    }

    router.push(`/dashboard?tab=${tabName}`);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 md:hidden">
      <div className="rounded-3xl border border-white/10 bg-black/80 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur-2xl">
        <div className="grid grid-cols-7 gap-1 px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              active={activeTab === item.key}
              onClick={() => goTo(item.key)}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl py-2 transition-all duration-200 ${
        active
          ? "bg-white/8 text-green-300"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {active && (
        <>
          <span className="absolute left-1/2 top-0 h-[2px] w-7 -translate-x-1/2 rounded-full bg-green-400" />
          <span className="absolute inset-0 rounded-2xl shadow-[0_0_18px_rgba(34,197,94,0.12)]" />
        </>
      )}

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
          active
            ? "border-green-400/30 bg-green-500/15 text-green-300"
            : "border-white/10 bg-white/5 text-gray-300"
        }`}
      >
        {icon}
      </div>

      <span
        className={`mt-1 text-[10px] font-medium leading-none ${
          active ? "text-green-300" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}