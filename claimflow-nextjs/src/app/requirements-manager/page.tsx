'use client';

import { AuthGuard } from "@/components/AuthGuard";
import RequirementsManager from "@/pages/RequirementsManager";

export default function RequirementsManagerPage() {
  return (
    <AuthGuard>
      <RequirementsManager />
    </AuthGuard>
  );
}
