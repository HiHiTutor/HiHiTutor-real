const Joi = require('joi');

const validateUserUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]*$/),
    userType: Joi.string().valid('student', 'tutor', 'organization', 'admin'),
    role: Joi.string().valid('user', 'admin'),
    status: Joi.string().valid('active', 'pending', 'blocked'),
    upgradeStatus: Joi.string().valid('pending', 'approved', 'rejected'),
    upgradeRejectionReason: Joi.string().when('upgradeStatus', {
      is: 'rejected',
      then: Joi.string().required(),
      otherwise: Joi.string().allow(''),
    }),
  });

  return schema.validate(data);
};

module.exports = {
  validateUserUpdate,
}; 