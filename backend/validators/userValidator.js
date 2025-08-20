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
      businessRegistration: Joi.string().allow('').allow(null),
      addressProof: Joi.string().allow('').allow(null)
    }),
    tutorProfile: Joi.object({
      sessionRate: Joi.number().min(0).allow(null),
      displayPublic: Joi.boolean().allow(null),
      teachingExperienceYears: Joi.number().min(0).allow(null),
      subjects: Joi.array().items(Joi.string()).allow(null).allow([]),
      examResults: Joi.array().allow(null).allow([]),
      teachingAreas: Joi.array().allow(null).allow([]),
      availableTime: Joi.array().allow(null).allow([]),
      teachingMethods: Joi.array().allow(null).allow([]),
      classType: Joi.array().allow(null).allow([]),
      documents: Joi.array().allow(null).allow([]),
      applicationStatus: Joi.string().valid('pending', 'approved', 'rejected', 'notApplied').allow(''),
      educationLevel: Joi.string().allow('').allow(null),
      // 課程相關字段 - 確保所有字段都被允許
      category: Joi.string().allow('').allow(null),
      subCategory: Joi.string().allow('').allow(null),
      teachingMode: Joi.string().allow('').allow(null),
      teachingSubModes: Joi.array().items(Joi.string()).allow(null).allow([]),
      region: Joi.string().allow('').allow(null),
      subRegions: Joi.array().items(Joi.string()).allow(null).allow([]),
      // 其他可能缺失的字段
      education: Joi.string().allow('').allow(null),
      experience: Joi.string().allow('').allow(null),
      specialties: Joi.array().allow(null).allow([]),
      gender: Joi.string().valid('male', 'female').allow('').allow(null),
      birthDate: Joi.string().allow('').allow(null),
      introduction: Joi.string().allow('').allow(null),
      courseFeatures: Joi.string().allow('').allow(null),
      avatarUrl: Joi.string().allow('').allow(null)
    }),
    subjects: Joi.array().items(Joi.string()).allow(null).allow([]),
    teachingAreas: Joi.array().allow(null).allow([]),
    teachingMethods: Joi.array().allow(null).allow([]),
    experience: Joi.number().min(0).allow(null),
    rating: Joi.number().min(0).allow(null),
    introduction: Joi.string().allow(''),
    qualifications: Joi.array().allow(null).allow([]),
    hourlyRate: Joi.number().min(0).allow(null),
    availableTime: Joi.array().allow(null).allow([]),
    isVip: Joi.boolean().allow(null),
    vipLevel: Joi.number().min(0).max(2).allow(null),
    isTop: Joi.boolean().allow(null),
    topLevel: Joi.number().min(0).max(2).allow(null),
    isPaid: Joi.boolean().allow(null),
    paymentType: Joi.string().valid('free', 'basic', 'premium', 'vip').allow(''),
    promotionLevel: Joi.number().min(0).max(5).allow(null)
  });

  return schema.validate(data);
};

module.exports = {
  validateUserUpdate,
}; 