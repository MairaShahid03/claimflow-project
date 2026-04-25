'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ClaimIncharge from "@/pages/ClaimIncharge";

export default function ClaimInchargePage() {
  return (
    <AuthGuard>
      <ClaimIncharge />
    </AuthGuard>
  );
}
