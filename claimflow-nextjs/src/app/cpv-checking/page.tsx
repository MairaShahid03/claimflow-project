'use client';

import { AuthGuard } from "@/components/AuthGuard";
import CPVChecking from "@/pages/CPVChecking";

export default function CPVCheckingPage() {
  return (
    <AuthGuard>
      <CPVChecking />
    </AuthGuard>
  );
}
