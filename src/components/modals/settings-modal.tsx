"use client";

import { Info, Monitor, Moon, Shield, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { setTheme } = useTheme();

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    toast.success(`Theme changed to ${theme}`);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Monitor size={14} /> Appearance
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="justify-start gap-2"
              >
                <Moon size={14} /> Mocha (Dark)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="justify-start gap-2"
              >
                <Sun size={14} /> Latte (Light)
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={14} /> System Info
            </h3>
            <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client Version</span>
                <span className="text-foreground font-mono">
                  v4.0.0 (Next.js)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Protocol</span>
                <span className="text-teal-500 font-mono">
                  Secure // Chunked
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Encryption</span>
                <span className="text-green-500 font-mono">AES-256-CTR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
