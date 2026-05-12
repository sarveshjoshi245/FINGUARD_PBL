/**
 * Application Status Constants
 * Used across onboarding, admin dashboard, and APIs
 */

const STATUSES = {
  // Onboarding Status
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  
  // Approval Status
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
  ESCALATED: 'ESCALATED',
  
  // Special Cases
  BLOCKED: 'BLOCKED',
  EXPIRED: 'EXPIRED',
  WITHDRAWN: 'WITHDRAWN',
};

const STATUS_LABELS = {
  [STATUSES.DRAFT]: 'Draft',
  [STATUSES.SUBMITTED]: 'Submitted',
  [STATUSES.UNDER_REVIEW]: 'Under Review',
  [STATUSES.PENDING_APPROVAL]: 'Pending Approval',
  [STATUSES.APPROVED]: 'Approved ✓',
  [STATUSES.REJECTED]: 'Rejected ✗',
  [STATUSES.FLAGGED]: 'Flagged',
  [STATUSES.ESCALATED]: 'Escalated',
  [STATUSES.BLOCKED]: 'Blocked',
  [STATUSES.EXPIRED]: 'Expired',
  [STATUSES.WITHDRAWN]: 'Withdrawn',
};

const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const RISK_COLORS = {
  [RISK_LEVELS.LOW]: '#10b981', // green
  [RISK_LEVELS.MEDIUM]: '#f59e0b', // amber
  [RISK_LEVELS.HIGH]: '#ef4444', // red
  [RISK_LEVELS.CRITICAL]: '#7c2d12', // dark red
};

module.exports = {
  STATUSES,
  STATUS_LABELS,
  RISK_LEVELS,
  RISK_COLORS,
};
