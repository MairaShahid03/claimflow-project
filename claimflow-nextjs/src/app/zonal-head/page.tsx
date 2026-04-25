'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ZonalHead from "@/pages/ZonalHead";

export default function ZonalHeadPage() {
  return (
    <AuthGuard>
      <ZonalHead />
    </AuthGuard>
  );
}
