'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ClaimPaymentVoucher from "@/pages/ClaimPaymentVoucher";

export default function ClaimPaymentVoucherPage() {
  return (
    <AuthGuard>
      <ClaimPaymentVoucher />
    </AuthGuard>
  );
}
