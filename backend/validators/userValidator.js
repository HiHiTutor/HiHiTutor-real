const Joi = require('joi');

const validateUserUpdate = (data) => {
  const schema = Joi.object({
    userId: Joi.string().allow(''),
    tutorId: Joi.string().allow(''),
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
    avatar: Joi.string().allow(''),
    isActive: Joi.boolean(),
    organizationDocuments: Joi.object({
      businessRegistration: Joi.string().allow('', null),
      addressProof: Joi.string().allow('', null)
    }),
    tutorProfile: Joi.object({
      sessionRate: Joi.number().min(0),
      displayPublic: Joi.boolean(),
      teachingExperienceYears: Joi.number().min(0),
      subjects: Joi.array(),
      examResults: Joi.array(),
      teachingAreas: Joi.array(),
      availableTime: Joi.array(),
      teachingMethods: Joi.array(),
      classType: Joi.array(),
      documents: Joi.array(),
      applicationStatus: Joi.string().valid('pending', 'approved', 'rejected', 'notApplied')
    }),
    subjects: Joi.array(),
    teachingAreas: Joi.array(),
    teachingMethods: Joi.array(),
    experience: Joi.number().min(0),
    rating: Joi.number().min(0),
    introduction: Joi.string().allow(''),
    qualifications: Joi.array(),
    hourlyRate: Joi.number().min(0),
    availableTime: Joi.array()
  });

  return schema.validate(data);
};

module.exports = {
  validateUserUpdate,
}; 