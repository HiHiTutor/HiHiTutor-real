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
      sessionRate: Joi.number().min(0).allow(null),
      displayPublic: Joi.boolean().allow(null),
      teachingExperienceYears: Joi.number().min(0).allow(null),
      subjects: Joi.array().items(Joi.string()).allow(null, []),
      examResults: Joi.array().allow(null, []),
      teachingAreas: Joi.array().allow(null, []),
      availableTime: Joi.array().allow(null, []),
      teachingMethods: Joi.array().allow(null, []),
      classType: Joi.array().allow(null, []),
      documents: Joi.array().allow(null, []),
      applicationStatus: Joi.string().valid('pending', 'approved', 'rejected', 'notApplied').allow(''),
      educationLevel: Joi.string().allow('', null),
      // 課程相關字段 - 確保所有字段都被允許
      category: Joi.string().allow('', null),
      subCategory: Joi.string().allow('', null),
      teachingMode: Joi.string().allow('', null),
      teachingSubModes: Joi.array().items(Joi.string()).allow(null, []),
      region: Joi.string().allow('', null),
      subRegions: Joi.array().items(Joi.string()).allow(null, []),
      // 其他可能缺失的字段
      education: Joi.string().allow('', null),
      experience: Joi.string().allow('', null),
      specialties: Joi.array().allow(null, []),
      gender: Joi.string().valid('male', 'female').allow('', null),
      birthDate: Joi.string().allow('', null),
      introduction: Joi.string().allow('', null),
      courseFeatures: Joi.string().allow('', null),
      avatarUrl: Joi.string().allow('', null)
    }),
    subjects: Joi.array().items(Joi.string()).allow(null, []),
    teachingAreas: Joi.array().allow(null, []),
    teachingMethods: Joi.array().allow(null, []),
    experience: Joi.number().min(0).allow(null),
    rating: Joi.number().min(0).allow(null),
    introduction: Joi.string().allow(''),
    qualifications: Joi.array().allow(null, []),
    hourlyRate: Joi.number().min(0).allow(null),
    availableTime: Joi.array().allow(null, []),
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