'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ZHSPage from "@/pages/ZHSPage";

export default function ZHSPageRoute() {
  return (
    <AuthGuard>
      <ZHSPage />
    </AuthGuard>
  );
}
