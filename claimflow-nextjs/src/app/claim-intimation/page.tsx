'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ClaimIntimation from "@/pages/ClaimIntimation";

export default function ClaimIntimationPage() {
  return (
    <AuthGuard>
      <ClaimIntimation />
    </AuthGuard>
  );
}
