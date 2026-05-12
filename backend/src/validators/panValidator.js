/**
 * PAN Validator
 * Specific validation for PAN document uploads
 */

const { z } = require('zod');
const { VALIDATION_PATTERNS } = require('../../../shared/constants/validation');

const panUploadValidator = z.object({
  pan: z.string()
    .regex(VALIDATION_PATTERNS.PAN, 'PAN must be in format: 5 letters, 4 numbers, 1 letter'),
  
  fileName: z.string().optional(),
  fileSize: z.number().max(5242880, 'File size must be less than 5MB').optional(),
  ocrConfidence: z.number().min(0).max(1).optional(),
});

module.exports = {
  panUploadValidator,
  validatePanUpload: (data) => panUploadValidator.safeParse(data),
};
