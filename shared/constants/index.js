/**
 * Shared Constants Index
 * Export all constants from one file for convenience
 */

const statuses = require('./statuses');
const fields = require('./fields');
const validation = require('./validation');

module.exports = {
  ...statuses,
  ...fields,
  ...validation,
};
