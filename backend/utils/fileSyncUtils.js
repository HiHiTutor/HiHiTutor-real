// 文件同步工具函數
// 用於統一 publicCertificates 和 educationCert 字段

/**
 * 統一用戶的兩個文件字段
 * @param {Object} user - 用戶對象
 * @param {string} sourceField - 源字段 ('educationCert' 或 'publicCertificates')
 * @returns {Object} 更新後的用戶對象
 */
function syncUserFileFields(user, sourceField = 'educationCert') {
  if (!user || user.userType !== 'tutor' || !user.tutorProfile) {
    return user;
  }

  const educationCerts = user.documents?.educationCert || [];
  const publicCerts = user.tutorProfile.publicCertificates || [];

  // 檢查兩個字段是否一致
  const educationSorted = [...educationCerts].sort();
  const publicSorted = [...publicCerts].sort();
  
  if (JSON.stringify(educationSorted) === JSON.stringify(publicSorted)) {
    console.log('✅ 文件字段已一致，無需同步');
    return user;
  }

  console.log('🔧 檢測到文件字段不一致，正在同步...');
  console.log('📊 educationCert 數量:', educationCerts.length);
  console.log('📊 publicCertificates 數量:', publicCerts.length);

  // 根據源字段統一數據
  if (sourceField === 'educationCert') {
    // 以 educationCert 為準，同步到 publicCertificates
    user.tutorProfile.publicCertificates = [...educationCerts];
    console.log('✅ 已將 educationCert 同步到 publicCertificates');
  } else if (sourceField === 'publicCertificates') {
    // 以 publicCertificates 為準，同步到 educationCert
    user.documents.educationCert = [...publicCerts];
    console.log('✅ 已將 publicCertificates 同步到 educationCert');
  }

  return user;
}

/**
 * 檢查文件字段是否一致
 * @param {Object} user - 用戶對象
 * @returns {Object} 檢查結果
 */
function checkFileFieldsConsistency(user) {
  if (!user || user.userType !== 'tutor' || !user.tutorProfile) {
    return { consistent: true, message: '非導師用戶或缺少 tutorProfile' };
  }

  const educationCerts = user.documents?.educationCert || [];
  const publicCerts = user.tutorProfile.publicCertificates || [];

  const educationSorted = [...educationCerts].sort();
  const publicSorted = [...publicCerts].sort();
  
  const isConsistent = JSON.stringify(educationSorted) === JSON.stringify(publicSorted);

  return {
    consistent: isConsistent,
    educationCertCount: educationCerts.length,
    publicCertificatesCount: publicCerts.length,
    educationCert: educationCerts,
    publicCertificates: publicCerts,
    message: isConsistent ? '字段一致' : '字段不一致'
  };
}

/**
 * 獲取文件差異
 * @param {Object} user - 用戶對象
 * @returns {Object} 文件差異
 */
function getFileFieldsDifference(user) {
  if (!user || user.userType !== 'tutor' || !user.tutorProfile) {
    return { differences: [], message: '非導師用戶或缺少 tutorProfile' };
  }

  const educationCerts = user.documents?.educationCert || [];
  const publicCerts = user.tutorProfile.publicCertificates || [];

  const educationFilenames = educationCerts.map(url => url.split('/').pop()).sort();
  const publicFilenames = publicCerts.map(url => url.split('/').pop()).sort();

  const onlyInEducation = educationFilenames.filter(filename => 
    !publicFilenames.includes(filename)
  );
  
  const onlyInPublic = publicFilenames.filter(filename => 
    !educationFilenames.includes(filename)
  );

  return {
    onlyInEducation,
    onlyInPublic,
    educationFilenames,
    publicFilenames,
    hasDifferences: onlyInEducation.length > 0 || onlyInPublic.length > 0
  };
}

module.exports = {
  syncUserFileFields,
  checkFileFieldsConsistency,
  getFileFieldsDifference
};
