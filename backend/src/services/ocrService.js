/**
 * OCR Service
 * Handles OCR processing and document extraction
 */

class OCRService {
  constructor(auditService) {
    this.auditService = auditService;
  }

  /**
   * Process document and extract text via OCR
   * Note: This is a placeholder that will be called from frontend
   * Real OCR processing happens on client-side with Tesseract.js
   */
  async processDocument(documentData, documentType, sessionId) {
    try {
      const result = {
        documentType,
        status: 'PENDING',
        confidence: 0,
        extractedData: {},
        timestamp: new Date().toISOString(),
      };

      // Log the OCR attempt
      await this.auditService.log({
        entityType: 'DOCUMENT',
        action: 'OCR_STARTED',
        performedBy: 'SYSTEM',
        details: {
          documentType,
          sessionId,
        },
      });

      return result;
    } catch (error) {
      console.error('❌ Error processing document:', error);
      throw error;
    }
  }

  /**
   * Validate OCR confidence score
   */
  validateConfidence(confidence, threshold = 0.5) {
    return confidence >= threshold;
  }

  /**
   * Extract field from OCR text
   */
  extractField(ocrText, fieldPattern) {
    try {
      const match = ocrText.match(fieldPattern);
      return match ? match[0] : null;
    } catch (error) {
      console.error('❌ Error extracting field:', error);
      return null;
    }
  }
}

module.exports = OCRService;
