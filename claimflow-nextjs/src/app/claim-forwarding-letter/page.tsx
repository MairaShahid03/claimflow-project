'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ClaimForwardingLetter from "@/pages/ClaimForwardingLetter";

export default function ClaimForwardingLetterPage() {
  return (
    <AuthGuard>
      <ClaimForwardingLetter />
    </AuthGuard>
  );
}
