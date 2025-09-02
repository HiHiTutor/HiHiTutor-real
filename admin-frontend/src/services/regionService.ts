import api from './api';

export interface SubRegion {
  value: string;
  label: string;
}

export interface Region {
  value: string;
  label: string;
  regions: SubRegion[];
}

class RegionService {
  private regionsCache: Region[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分鐘緩存

  /**
   * 獲取所有地區配置
   */
  async getRegions(): Promise<Region[]> {
    const now = Date.now();
    
    // 如果緩存有效，直接返回緩存數據
    if (this.regionsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.regionsCache;
    }

    try {
      const response = await api.get('/regions');
      this.regionsCache = response.data;
      this.cacheTimestamp = now;
      return response.data;
    } catch (error) {
      console.error('Failed to load regions:', error);
      // 如果API失敗，返回空數組
      return [];
    }
  }

  /**
   * 根據地區值獲取地區標籤
   */
  async getRegionLabel(value: string): Promise<string> {
    try {
      const response = await api.get(`/regions/label/${value}`);
      return response.data.label;
    } catch (error) {
      console.error(`Failed to get region label for ${value}:`, error);
      return value; // 如果獲取失敗，返回原始值
    }
  }

  /**
   * 根據子地區值獲取子地區標籤
   */
  async getSubRegionLabel(value: string): Promise<{ label: string; regionLabel: string; regionValue: string }> {
    try {
      const response = await api.get(`/regions/subregion/label/${value}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get sub-region label for ${value}:`, error);
      return { label: value, regionLabel: '', regionValue: '' };
    }
  }

  /**
   * 清除緩存
   */
  clearCache(): void {
    this.regionsCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * 根據地區值查找地區對象
   */
  async findRegionByValue(value: string): Promise<Region | undefined> {
    const regions = await this.getRegions();
    return regions.find(region => region.value === value);
  }

  /**
   * 根據子地區值查找子地區對象
   */
  async findSubRegionByValue(value: string): Promise<{ subRegion: SubRegion; region: Region } | undefined> {
    const regions = await this.getRegions();
    
    for (const region of regions) {
      const subRegion = region.regions.find(sub => sub.value === value);
      if (subRegion) {
        return { subRegion, region };
      }
    }
    
    return undefined;
  }

  /**
   * 獲取所有子地區的扁平列表
   */
  async getAllSubRegions(): Promise<Array<SubRegion & { regionLabel: string; regionValue: string }>> {
    const regions = await this.getRegions();
    const allSubRegions: Array<SubRegion & { regionLabel: string; regionValue: string }> = [];
    
    regions.forEach(region => {
      region.regions.forEach(subRegion => {
        allSubRegions.push({
          ...subRegion,
          regionLabel: region.label,
          regionValue: region.value
        });
      });
    });
    
    return allSubRegions;
  }
}

// 創建單例實例
const regionService = new RegionService();

export default regionService;
