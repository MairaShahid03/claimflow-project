'use client';

import { AuthGuard } from "@/components/AuthGuard";
import Dispatching from "@/pages/Dispatching";

export default function DispatchingPage() {
  return (
    <AuthGuard>
      <Dispatching />
    </AuthGuard>
  );
}
