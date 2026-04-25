'use client';

import { AuthGuard } from "@/components/AuthGuard";
import Settings from "@/pages/Settings";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <Settings />
    </AuthGuard>
  );
}
