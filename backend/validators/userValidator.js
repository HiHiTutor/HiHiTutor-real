const Joi = require('joi');

const validateUserUpdate = (data) => {
  const schema = Joi.object({
    userId: Joi.string().optional().allow(''),
    tutorId: Joi.string().optional().allow(''),
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]*$/).optional(),
    userType: Joi.string().valid('student', 'tutor', 'organization', 'admin', 'super_admin').optional(),
    role: Joi.string().valid('user', 'admin', 'super_admin').optional(),
    status: Joi.string().valid('active', 'pending', 'blocked').optional(),
    upgradeStatus: Joi.string().valid('pending', 'approved', 'rejected').optional(),
    upgradeRejectionReason: Joi.string().when('upgradeStatus', {
      is: 'rejected',
      then: Joi.string().required(),
      otherwise: Joi.string().optional().allow(''),
    }),
    avatar: Joi.string().optional().allow(''),
    isActive: Joi.boolean().optional(),
    organizationDocuments: Joi.object({
      businessRegistration: Joi.string().optional().allow('', null),
      addressProof: Joi.string().optional().allow('', null)
    }).optional(),
    tutorProfile: Joi.object({
      sessionRate: Joi.number().min(0).optional(),
      displayPublic: Joi.boolean().optional(),
      teachingExperienceYears: Joi.number().min(0).optional(),
      subjects: Joi.array().items(Joi.string()).optional().default([]),
      examResults: Joi.array().optional().default([]),
      teachingAreas: Joi.array().optional().default([]),
      availableTime: Joi.array().optional().default([]),
      teachingMethods: Joi.array().optional().default([]),
      classType: Joi.array().optional().default([]),
      documents: Joi.array().optional().default([]),
      applicationStatus: Joi.string().valid('pending', 'approved', 'rejected', 'notApplied').optional().allow(''),
      educationLevel: Joi.string().optional().allow(''),
      // 課程相關字段 - 確保所有字段都被允許
      category: Joi.string().optional().allow(''),
      subCategory: Joi.string().optional().allow(''),
      teachingMode: Joi.string().optional().allow(''),
      teachingSubModes: Joi.array().items(Joi.string()).optional().default([]),
      region: Joi.string().optional().allow(''),
      subRegions: Joi.array().items(Joi.string()).optional().default([]),
      // 其他可能缺失的字段
      education: Joi.string().optional().allow(''),
      experience: Joi.string().optional().allow(''),
      specialties: Joi.array().optional().default([]),
      gender: Joi.string().valid('male', 'female').optional().allow(''),
      birthDate: Joi.string().optional().allow(''),
      introduction: Joi.string().optional().allow(''),
      courseFeatures: Joi.string().optional().allow(''),
      avatarUrl: Joi.string().optional().allow(''),
      // 添加缺失的字段
      qualifications: Joi.array().optional().default([]),
      publicCertificates: Joi.array().optional().default([])
    }).optional().unknown(true),
    subjects: Joi.array().items(Joi.string()).optional().default([]),
    teachingAreas: Joi.array().optional().default([]),
    teachingMethods: Joi.array().optional().default([]),
    experience: Joi.number().min(0).optional(),
    rating: Joi.number().min(0).optional(),
    introduction: Joi.string().optional().allow(''),
    qualifications: Joi.array().optional().default([]),
    hourlyRate: Joi.number().min(0).optional(),
    availableTime: Joi.array().optional().default([]),
    isVip: Joi.boolean().optional(),
    vipLevel: Joi.number().min(0).max(2).optional(),
    isTop: Joi.boolean().optional(),
    topLevel: Joi.number().min(0).max(2).optional(),
    isPaid: Joi.boolean().optional(),
    paymentType: Joi.string().valid('free', 'basic', 'premium', 'vip').optional().allow(''),
    promotionLevel: Joi.number().min(0).max(5).optional()
  });

  return schema.validate(data);
};

module.exports = {
  validateUserUpdate,
}; 