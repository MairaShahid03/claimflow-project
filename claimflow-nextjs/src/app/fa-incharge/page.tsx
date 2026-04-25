'use client';

import { AuthGuard } from "@/components/AuthGuard";
import FAIncharge from "@/pages/FAIncharge";

export default function FAInchargePage() {
  return (
    <AuthGuard>
      <FAIncharge />
    </AuthGuard>
  );
}
