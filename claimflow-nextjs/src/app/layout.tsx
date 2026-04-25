import type { Metadata } from "next";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClaimProvider } from "@/contexts/ClaimContext";

import "@/index.css";

export const metadata: Metadata = {
  title: "ClaimFlow Pakistan",
  description: "Insurance Claim Management System",
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ClaimProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </ClaimProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
