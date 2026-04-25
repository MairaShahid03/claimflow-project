import { Role } from '@/contexts/AuthContext';

// Maps Role display names to Supabase current_stage values
export const ROLE_TO_STAGE: Record<Role, string> = {
  'Claim Intimation': 'claim_intimation',
  'Requirements Manager': 'requirements_manager',
  'Claim Payment Voucher': 'claim_payment_voucher',
  'CPV Checking': 'cpv_checking',
  'Claim Incharge': 'claim_incharge',
  'PHS Incharge': 'phs_incharge',
  'F&A Incharge': 'fa_incharge',
  'Auditor': 'auditor',
  'ZHS': 'zhs',
  'Cheque Preparation': 'cheque_preparation',
  'Claim Forwarding Letter': 'claim_forwarding_letter',
  'Dispatching': 'dispatching',
  'Zonal Head': 'zonal_head',
};

export const STAGE_TO_ROLE: Record<string, Role> = Object.fromEntries(
  Object.entries(ROLE_TO_STAGE).map(([k, v]) => [v, k as Role])
) as Record<string, Role>;

const WORKFLOW_ORDER: string[] = [
  'claim_intimation',
  'requirements_manager',
  'claim_payment_voucher',
  'cpv_checking',
  'claim_incharge',
  'phs_incharge',
  'fa_incharge',
  'auditor',
  'zhs',
  'cheque_preparation',
  'claim_forwarding_letter',
  'dispatching',
];

export function getNextStage(currentStage: string): string | null {
  const idx = WORKFLOW_ORDER.indexOf(currentStage);
  if (idx === -1 || idx >= WORKFLOW_ORDER.length - 1) return null;
  return WORKFLOW_ORDER[idx + 1];
}

export function getRoleDisplayName(stage: string): string {
  return STAGE_TO_ROLE[stage] || stage;
}
