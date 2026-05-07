import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.svg";
import { Tabs } from "@/shared/components/Tabs";
import type { DashboardHeaderProps } from "../types";

export function DashboardHeader({
  connected,
  tabs,
  activeTab,
  setActiveTab,
}: Omit<DashboardHeaderProps, "roomId">) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-black/5 z-50">
      <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <img src={logoUrl} alt="Logo" className="h-9 w-9" />
            <div className="flex flex-col">
              <span className="text-black font-bold tracking-tighter text-xl leading-none">
                PLAYMUSIC
              </span>
              <span className="text-[11px] text-orange-500 font-bold uppercase tracking-wider">
                Admin Dashboard
              </span>
            </div>
          </Link>

          <div className="hidden lg:block h-8 w-px bg-black/5" />

          {/* Moved Tabs Here */}
          <div className="hidden lg:block">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${connected ? "bg-orange-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-sm font-medium text-black/50">
              {connected ? "Connected" : "Reconnecting..."}
            </span>
          </div>

          <div className="h-8 w-px bg-black/8" />

          <Link
            to="/admin"
            className="px-6 py-2 bg-black hover:bg-orange-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            Hub
          </Link>
        </div>
      </div>
    </header>
  );
}
