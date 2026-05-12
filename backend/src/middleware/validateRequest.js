/**
 * Request Validation Middleware
 * Factory to create middleware for validating request bodies against schemas
 */

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }
      
      // Attach validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    }
  };
};

module.exports = validateRequest;
