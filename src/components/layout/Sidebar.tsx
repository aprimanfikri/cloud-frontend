"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Cloud,
  HardDrive,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileSystem } from "@/context/FileSystemContext";

interface SidebarProps {
  onSettingsClick?: () => void;
  className?: string;
}

const Sidebar = ({ onSettingsClick, className }: SidebarProps) => {
  const pathname = usePathname();
  const { stats } = useFileSystem();

  const menuItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      active: pathname === "/",
    },
    {
      href: "/files",
      label: "My Files",
      icon: <HardDrive size={18} />,
      active: pathname === "/files",
    },
    {
      href: "/recent",
      label: "Recent",
      icon: <Clock size={18} />,
      active: pathname === "/recent",
    },
  ];

  return (
    <aside
      className={cn(
        "w-full md:w-72 bg-sidebar border-r border-border/40 flex flex-col h-full shrink-0 relative overflow-hidden z-20",
        className,
      )}
    >
      <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="p-6 pb-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
            <Cloud size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">
              xfrhk drive
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Cloud Storage
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto relative z-10">
        <div className="text-[10px] uppercase font-bold text-muted-foreground/50 px-4 mb-3 tracking-widest">
          Browse
        </div>

        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-4 py-2 h-10 font-medium transition-all rounded-full",
                item.active
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}

        <div className="text-[10px] uppercase font-bold text-muted-foreground/50 px-4 mt-8 mb-3 tracking-widest">
          Storage
        </div>

        <div className="mx-2 bg-muted/30 rounded-2xl p-4 border border-border/40">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-xl font-bold text-foreground block leading-none">
                {Math.round((stats.size / (50 * 1024 * 1024 * 1024)) * 100)}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Used
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-foreground block">
                {formatBytes(stats.size)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                of 50 GB
              </span>
            </div>
          </div>

          <Progress
            value={Math.min(
              (stats.size / (50 * 1024 * 1024 * 1024)) * 100,
              100,
            )}
            className="h-1.5 mb-0 bg-muted-foreground/10"
          />
        </div>
      </nav>

      <div className="p-4 relative z-10">
        <Button
          variant="ghost"
          onClick={onSettingsClick}
          className="w-full justify-start gap-3 px-4 h-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
