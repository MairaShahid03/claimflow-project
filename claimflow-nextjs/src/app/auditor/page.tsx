'use client';

import { AuthGuard } from "@/components/AuthGuard";
import AuditorPage from "@/pages/AuditorPage";

export default function AuditorPageRoute() {
  return (
    <AuthGuard>
      <AuditorPage />
    </AuthGuard>
  );
}
