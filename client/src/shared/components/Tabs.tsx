import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  activeColor?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  activeColor = "#F57923",
}: TabsProps) {
  return (
    <nav className={`flex items-center gap-12 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              text-sm font-bold tracking-[0.2em] uppercase py-2 transition-all relative
              ${isActive ? "text-black" : "text-black/30 hover:text-black/60"}
            `}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                style={{ backgroundColor: activeColor }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
