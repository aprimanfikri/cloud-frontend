"use client";

import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { useFileSystem } from "@/context/FileSystemContext";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  const { view, searchTerm, setSearchTerm, stats } = useFileSystem();
  const [syncStatus] = useState("Online");

  return (
    <header className="h-20 flex items-center justify-between px-8 shrink-0 bg-background/50 backdrop-blur-xl z-10 transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 text-foreground hover:bg-muted/50 rounded-full transition-colors">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Opens the main navigation sidebar.
              </SheetDescription>
            </SheetHeader>
            <Sidebar onSettingsClick={onSettingsClick} />
          </SheetContent>
        </Sheet>

        <h2 className="text-2xl font-bold text-foreground hidden md:block capitalize tracking-tight">
          {view === "dashboard"
            ? "Dashboard"
            : view === "files"
              ? "My Files"
              : "Recent Files"}
        </h2>

        <div className="relative max-w-md w-full ml-8 hidden sm:block">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            />
            <Input
              type="text"
              className="pl-11 h-11 rounded-full bg-muted/40 border-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-primary/20 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all shadow-sm"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-muted/40 backdrop-blur-md">
          <div
            className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
              syncStatus === "Synced" || syncStatus === "Online"
                ? "bg-emerald-500 text-emerald-500"
                : syncStatus === "Saving..."
                  ? "bg-amber-500 text-amber-500 animate-pulse"
                  : "bg-rose-500 text-rose-500",
            )}
          ></div>
          <span className="text-xs font-semibold text-muted-foreground w-12 text-center">
            {syncStatus}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 border-l border-border/40 pl-6 py-1">
          <span className="text-sm font-bold text-foreground leading-none">
            {stats.count}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Items
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
