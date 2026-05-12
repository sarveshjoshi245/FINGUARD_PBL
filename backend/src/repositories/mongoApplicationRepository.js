/**
 * Application Repository (MongoDB/Mongoose)
 * Phase 2 implementation using MongoDB
 * Same interface as JSON version for seamless migration
 */

const Application = require('../models/Application');

class ApplicationRepository {
  /**
   * Create a new application
   */
  async create(applicationData) {
    try {
      const application = new Application(applicationData);
      await application.save();
      return application.toObject();
    } catch (error) {
      console.error('❌ Error creating application:', error);
      throw error;
    }
  }

  /**
   * Find application by ID
   */
  async findById(id) {
    try {
      const application = await Application.findById(id);
      return application ? application.toObject() : null;
    } catch (error) {
      console.error('❌ Error finding application:', error);
      throw error;
    }
  }

  /**
   * Find all applications with optional filters
   */
  async findAll(filters = {}) {
    try {
      let query = Application.find();

      // Apply filters
      if (filters.status) {
        query = query.where('status').equals(filters.status);
      }
      if (filters.mobile) {
        query = query.where('mobile').equals(filters.mobile);
      }
      if (filters.aadhaar) {
        query = query.where('aadhaar').equals(filters.aadhaar);
      }
      if (filters.riskLevel) {
        query = query.where('riskLevel').equals(filters.riskLevel);
      }

      // Sort by createdAt descending
      query = query.sort({ createdAt: -1 });

      const applications = await query.exec();
      return applications.map(app => app.toObject());
    } catch (error) {
      console.error('❌ Error finding applications:', error);
      throw error;
    }
  }

  /**
   * Update an application
   */
  async update(id, updatedData) {
    try {
      const application = await Application.findByIdAndUpdate(
        id,
        { ...updatedData, updatedAt: new Date() },
        { new: true }
      );
      if (!application) {
        throw new Error('Application not found');
      }
      return application.toObject();
    } catch (error) {
      console.error('❌ Error updating application:', error);
      throw error;
    }
  }

  /**
   * Delete an application
   */
  async delete(id) {
    try {
      const result = await Application.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Application not found');
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting application:', error);
      throw error;
    }
  }

  /**
   * Count applications by status
   */
  async countByStatus() {
    try {
      const counts = await Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {};
      counts.forEach(item => {
        result[item._id] = item.count;
      });
      return result;
    } catch (error) {
      console.error('❌ Error counting applications:', error);
      throw error;
    }
  }

  /**
   * Search applications by name or email
   */
  async search(query) {
    try {
      const results = await Application.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { mobile: query },
          { aadhaar: query },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(50);

      return results.map(app => app.toObject());
    } catch (error) {
      console.error('❌ Error searching applications:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const total = await Application.countDocuments();
      const byStatus = await this.countByStatus();
      const avgBiometricScore = await Application.aggregate([
        { $group: { _id: null, avg: { $avg: '$biometricScore' } } },
      ]);

      return {
        total,
        byStatus,
        averageBiometricScore: avgBiometricScore[0]?.avg || 0,
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }
}

module.exports = ApplicationRepository;
