/**
 * Onboarding Field Constants
 * All field names and mappings used in KYC/onboarding
 */

const FIELDS = {
  // Personal Information
  NAME: 'name',
  EMAIL: 'email',
  MOBILE: 'mobile',
  DOB: 'dateOfBirth',
  GENDER: 'gender',
  
  // Address
  ADDRESS_LINE1: 'addressLine1',
  ADDRESS_LINE2: 'addressLine2',
  CITY: 'city',
  STATE: 'state',
  POSTAL_CODE: 'postalCode',
  COUNTRY: 'country',
  
  // KYC Documents
  AADHAAR: 'aadhaar',
  PAN: 'pan',
  DRIVING_LICENSE: 'drivingLicense',
  PASSPORT: 'passport',
  
  // Employment
  OCCUPATION: 'occupation',
  INCOME: 'annualIncome',
  EMPLOYER: 'employer',
  EMPLOYMENT_TYPE: 'employmentType',
  
  // Financial
  ACCOUNT_TYPE: 'accountType',
  MONTHLY_SPEND: 'monthlySpend',
  SAVINGS_GOAL: 'savingsGoal',
  
  // Verification
  FACE_VERIFIED: 'faceVerified',
  SIGNATURE_VERIFIED: 'signatureVerified',
  OCR_STATUS: 'ocrStatus',
  BIOMETRIC_SCORE: 'biometricScore',
  
  // Compliance
  PEP_DECLARATION: 'pepDeclaration',
  FATCA_DECLARATION: 'fatcaDeclaration',
  RBI_CONSENT: 'rbiConsent',
};

const ONBOARDING_STEPS = {
  PERSONAL_INFO: 0,
  CONTACT_INFO: 1,
  AADHAAR: 2,
  PAN: 3,
  FACE_VERIFICATION: 4,
  SIGNATURE_VERIFICATION: 5,
  INCOME_DETAILS: 6,
  COMPLIANCE_DECLARATION: 7,
  REVIEW_SUBMIT: 8,
};

const STEP_LABELS = {
  [ONBOARDING_STEPS.PERSONAL_INFO]: 'Personal Information',
  [ONBOARDING_STEPS.CONTACT_INFO]: 'Contact Details',
  [ONBOARDING_STEPS.AADHAAR]: 'Aadhaar Verification',
  [ONBOARDING_STEPS.PAN]: 'PAN Verification',
  [ONBOARDING_STEPS.FACE_VERIFICATION]: 'Face Verification',
  [ONBOARDING_STEPS.SIGNATURE_VERIFICATION]: 'Signature Verification',
  [ONBOARDING_STEPS.INCOME_DETAILS]: 'Income Details',
  [ONBOARDING_STEPS.COMPLIANCE_DECLARATION]: 'Declarations',
  [ONBOARDING_STEPS.REVIEW_SUBMIT]: 'Review & Submit',
};

module.exports = {
  FIELDS,
  ONBOARDING_STEPS,
  STEP_LABELS,
};
