'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ChequePreparation from "@/pages/ChequePreparation";

export default function ChequePreparationPage() {
  return (
    <AuthGuard>
      <ChequePreparation />
    </AuthGuard>
  );
}
