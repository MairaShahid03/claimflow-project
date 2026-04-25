'use client';

import { AuthGuard } from "@/components/AuthGuard";
import PHSIncharge from "@/pages/PHSIncharge";

export default function PHSInchargePage() {
  return (
    <AuthGuard>
      <PHSIncharge />
    </AuthGuard>
  );
}
