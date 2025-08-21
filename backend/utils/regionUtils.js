const regionOptions = require('../constants/regionOptions');

/**
 * 根據地區值獲取地區標籤
 * @param {string} value - 地區值
 * @returns {string|null} 地區標籤
 */
const getRegionLabel = (value) => {
  if (!value) return null;
  
  const region = regionOptions.find(r => r.value === value);
  return region ? region.label : null;
};

/**
 * 根據子地區值獲取子地區標籤
 * @param {string} value - 子地區值
 * @returns {string|null} 子地區標籤
 */
const getSubRegionLabel = (value) => {
  if (!value) return null;
  
  for (const region of regionOptions) {
    const subRegion = region.regions.find(sr => sr.value === value);
    if (subRegion) {
      return subRegion.label;
    }
  }
  return null;
};

/**
 * 根據子地區值獲取父地區信息
 * @param {string} value - 子地區值
 * @returns {object|null} 父地區信息
 */
const getParentRegion = (value) => {
  if (!value) return null;
  
  for (const region of regionOptions) {
    const subRegion = region.regions.find(sr => sr.value === value);
    if (subRegion) {
      return {
        value: region.value,
        label: region.label
      };
    }
  }
  return null;
};

/**
 * 獲取所有地區選項
 * @returns {Array} 地區選項數組
 */
const getAllRegionOptions = () => {
  return regionOptions;
};

/**
 * 驗證地區值是否有效
 * @param {string} value - 地區值
 * @returns {boolean} 是否有效
 */
const isValidRegion = (value) => {
  if (!value) return false;
  return regionOptions.some(r => r.value === value);
};

/**
 * 驗證子地區值是否有效
 * @param {string} value - 子地區值
 * @returns {boolean} 是否有效
 */
const isValidSubRegion = (value) => {
  if (!value) return false;
  
  for (const region of regionOptions) {
    if (region.regions.some(sr => sr.value === value)) {
      return true;
    }
  }
  return false;
};

/**
 * 格式化地區顯示文本
 * @param {string} region - 主要地區值
 * @param {Array} subRegions - 子地區值數組
 * @returns {string} 格式化的地區文本
 */
const formatRegionDisplay = (region, subRegions = []) => {
  if (!region) return '';
  
  const regionLabel = getRegionLabel(region);
  if (!regionLabel) return '';
  
  if (subRegions.length === 0) {
    return regionLabel;
  }
  
  const subRegionLabels = subRegions
    .map(sub => getSubRegionLabel(sub))
    .filter(label => label)
    .join('、');
  
  return subRegionLabels ? `${regionLabel} - ${subRegionLabels}` : regionLabel;
};

module.exports = {
  getRegionLabel,
  getSubRegionLabel,
  getParentRegion,
  getAllRegionOptions,
  isValidRegion,
  isValidSubRegion,
  formatRegionDisplay
};
