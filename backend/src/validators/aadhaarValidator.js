/**
 * Aadhaar Validator
 * Specific validation for Aadhaar document uploads
 */

const { z } = require('zod');
const { VALIDATION_PATTERNS } = require('../../../shared/constants/validation');

const aadhaarUploadValidator = z.object({
  aadhaar: z.string()
    .regex(VALIDATION_PATTERNS.AADHAAR, 'Aadhaar must be 12 digits'),
  
  fileName: z.string().optional(),
  fileSize: z.number().max(5242880, 'File size must be less than 5MB').optional(),
  ocrConfidence: z.number().min(0).max(1).optional(),
});

module.exports = {
  aadhaarUploadValidator,
  validateAadhaarUpload: (data) => aadhaarUploadValidator.safeParse(data),
};
