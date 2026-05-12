/**
 * Validation Constants
 * Regex patterns, field lengths, and validation thresholds
 */

const VALIDATION_PATTERNS = {
  // Identity Documents
  AADHAAR: /^[2-9]{1}[0-9]{11}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  
  // Contact Information
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE: /^[6-9]\d{9}$/,
  PHONE: /^[0-9\-\+\(\) ]{7,15}$/,
  
  // Personal
  NAME: /^[a-zA-Z\s]{2,100}$/,
  CITY: /^[a-zA-Z\s]{2,50}$/,
  STATE: /^[a-zA-Z\s]{2,50}$/,
  
  // Postal Code
  POSTAL_CODE_INDIA: /^[0-9]{6}$/,
  
  // Currency/Numbers
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  POSITIVE_NUMBER: /^[0-9]+$/,
  PERCENTAGE: /^([0-9]|[1-9][0-9]|100)$/,
};

const FIELD_LENGTHS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  
  AADHAAR_LENGTH: 12,
  PAN_LENGTH: 10,
  
  EMAIL_MAX: 100,
  MOBILE_LENGTH: 10,
  
  POSTAL_CODE_LENGTH: 6,
  
  ADDRESS_MIN: 5,
  ADDRESS_MAX: 200,
};

const CONFIDENCE_THRESHOLDS = {
  OCR_MINIMUM: 0.5,
  FACE_DETECTION_MINIMUM: 0.7,
  SIGNATURE_MATCH_MINIMUM: 0.65,
  BIOMETRIC_SCORE_MINIMUM: 70,
};

const VALIDATION_ERRORS = {
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  TOO_SHORT: 'Too short',
  TOO_LONG: 'Too long',
  INVALID_AADHAAR: 'Aadhaar must be 12 digits',
  INVALID_PAN: 'PAN must be 10 characters (5 letters, 4 numbers, 1 letter)',
  INVALID_EMAIL: 'Enter a valid email address',
  INVALID_MOBILE: 'Enter a valid 10-digit mobile number',
  INVALID_POSTAL_CODE: 'Enter a valid 6-digit postal code',
  NUMBERS_ONLY: 'Only numbers allowed',
  LETTERS_ONLY: 'Only letters allowed',
};

module.exports = {
  VALIDATION_PATTERNS,
  FIELD_LENGTHS,
  CONFIDENCE_THRESHOLDS,
  VALIDATION_ERRORS,
};
