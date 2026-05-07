import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Tabs, type TabItem } from "./Tabs";
import { SecretDoor } from "./SecretDoor";

interface AdminHeaderProps {
  user?: {
    username: string;
    role: string;
  };
  connected?: boolean;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (id: any) => void;
  onLogout: () => void;
  showBackToHub?: boolean;
  title?: string;
}

export function AdminHeader({
  user,
  connected = true,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  showBackToHub = false,
  title,
}: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center bg-white/10 backdrop-blur-sm">
      <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
        {/* Left Section: Branding & Context */}
        <div className="flex items-center gap-5">
          <SecretDoor size="xl" />
          <div className="flex flex-col">
            <span className="text-black font-bebas text-5xl tracking-tighter leading-none uppercase">
              PLAY LIST
            </span>
            <span className="text-xs text-black/20 font-bold uppercase tracking-[0.2em] leading-none mt-1">
              {title || "Archive Admin"}
            </span>
          </div>

          <div className="hidden lg:block w-px h-8 bg-black/5" />

          {/* Optional Center Tabs */}
          {tabs && activeTab && onTabChange && (
            <div className="hidden lg:block ml-4">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />
            </div>
          )}
        </div>

        {/* Right Section: User & Actions */}
        <div className="flex items-center gap-8">
          {/* Connection Status */}
          <div className="hidden sm:flex items-center gap-4 px-8 py-4 bg-black/5 rounded-full">
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-black/40">
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          <div className="h-6 w-px bg-black/5" />

          {/* User Info */}
          {user && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-base font-bold text-black leading-none">
                {user.username.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1.5">
                {user.role === "super_admin" ? "Head Admin" : "Station Admin"}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            {showBackToHub && (
              <Link
                to="/admin"
                className="px-10 py-4 bg-[#f8f8f6] hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
              >
                Hub
              </Link>
            )}

            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
