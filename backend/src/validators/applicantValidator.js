/**
 * Application/Onboarding Submission Validator
 * Validates complete application submission from frontend
 */

const { z } = require('zod');
const { VALIDATION_PATTERNS } = require('../../../shared/constants/validation');

const applicantValidator = z.object({
  // Personal Information
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Invalid email address'),
  
  mobile: z.string()
    .regex(VALIDATION_PATTERNS.MOBILE, 'Invalid 10-digit mobile number'),
  
  dateOfBirth: z.string()
    .refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
  
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  
  // Address
  addressLine1: z.string()
    .min(5, 'Address too short')
    .max(200, 'Address too long'),
  
  addressLine2: z.string().optional(),
  
  city: z.string()
    .min(2, 'City name too short')
    .max(50, 'City name too long'),
  
  state: z.string()
    .min(2, 'State name too short')
    .max(50, 'State name too long'),
  
  postalCode: z.string()
    .regex(VALIDATION_PATTERNS.POSTAL_CODE_INDIA, 'Invalid 6-digit postal code'),
  
  country: z.string().default('INDIA'),
  
  // KYC Documents
  aadhaar: z.string()
    .regex(VALIDATION_PATTERNS.AADHAAR, 'Invalid Aadhaar number'),
  
  pan: z.string()
    .regex(VALIDATION_PATTERNS.PAN, 'Invalid PAN format'),
  
  // Employment
  occupation: z.string().optional(),
  annualIncome: z.string()
    .regex(VALIDATION_PATTERNS.POSITIVE_NUMBER, 'Income must be a number')
    .optional(),
  
  // Compliance
  rbiConsent: z.boolean().refine(val => val === true, 'RBI consent required'),
  pepDeclaration: z.boolean().optional().default(false),
  fatcaDeclaration: z.boolean().optional().default(false),
  
  // Verification Results
  faceVerified: z.boolean().optional().default(false),
  signatureVerified: z.boolean().optional().default(false),
  biometricScore: z.number().min(0).max(100).optional().default(0),
  ocrStatus: z.enum(['PENDING', 'VERIFIED', 'FAILED']).optional().default('PENDING'),
});

module.exports = {
  applicantValidator,
  validateApplicant: (data) => applicantValidator.safeParse(data),
};
