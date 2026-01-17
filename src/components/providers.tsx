"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { FileSystemProvider } from "@/context/file-system-context";
import { UploadProvider } from "@/context/upload-context";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={null}>
        <FileSystemProvider>
          <UploadProvider>
            {children}
            <Toaster />
          </UploadProvider>
        </FileSystemProvider>
      </Suspense>
    </NextThemesProvider>
  );
}
