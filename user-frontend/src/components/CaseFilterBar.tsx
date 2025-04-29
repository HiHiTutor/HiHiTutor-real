import { useState, useEffect } from 'react';

const CATEGORY_OPTIONS = [
  { label: '中小學教育', value: '中小學教育', sub: ['小學學科', '中學學科', '數學', '英文', '中文', '物理', '化學', '生物', '通識', '歷史', '地理', '經濟', '倫理與宗教', '科學', '數學延伸'] },
  { label: '語言學習', value: '語言學習', sub: ['英文', '普通話', '英文會話', '中文寫作', '英文寫作', 'DSE'] },
  { label: '興趣學習', value: '興趣學習', sub: ['音樂', '鋼琴', '藝術', '視覺藝術', '設計', '科技', '體育', '家政'] },
  { label: '專業教育', value: '專業教育', sub: ['會計', '商業學', '資訊科技', '旅遊', '款待'] },
];
const REGION_OPTIONS = ['不限', '香港島', '九龍', '新界', '離島'];
const PRICE_MIN = 50;
const PRICE_MAX = 1000;

interface CaseFilterBarProps {
  onFilter: (data: any[]) => void;
  fetchUrl?: string;
}

export default function CaseFilterBar({ onFilter, fetchUrl = '/api/find-tutor-cases' }: CaseFilterBarProps) {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [subOptions, setSubOptions] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      const found = CATEGORY_OPTIONS.find(c => c.value === category);
      setSubOptions(found ? found.sub : []);
      setSubCategory([]); // reset subCategory when category changes
    } else {
      setSubOptions([]);
      setSubCategory([]);
    }
  }, [category]);

  useEffect(() => {
    // fetch 篩選結果
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (subCategory.length > 0) params.append('subCategory', subCategory.join(','));
    if (region.length > 0) params.append('region', region.join(','));
    params.append('priceMin', priceRange[0].toString());
    params.append('priceMax', priceRange[1].toString());
    fetch(`${fetchUrl}?${params.toString()}`)
      .then(res => res.json())
      .then(data => onFilter(data));
  }, [category, subCategory, region, priceRange, onFilter, fetchUrl]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 mb-4">
      <div className="bg-white border border-blue-200 p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
        {/* 大分類 */}
        <div>
          <label className="block text-sm font-medium mb-1">大分類</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="">全部</option>
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* 小分類 */}
        <div style={{ minWidth: 220 }}>
          <label className="block text-sm font-medium mb-1">小分類</label>
          {subOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subOptions.map(sub => (
                <label key={sub} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={sub}
                    checked={subCategory.includes(sub)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSubCategory([...subCategory, sub]);
                      } else {
                        setSubCategory(subCategory.filter(s => s !== sub));
                      }
                    }}
                    className="mr-1"
                  />
                  {sub}
                </label>
              ))}
            </div>
          ) : (
            <div style={{ height: 38 }}></div>
          )}
        </div>
        {/* 地區 */}
        <div>
          <label className="block text-sm font-medium mb-1">地區</label>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map(r => (
              <label key={r} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={r}
                  checked={region.includes(r)}
                  onChange={e => {
                    if (e.target.checked) {
                      setRegion([...region, r]);
                    } else {
                      setRegion(region.filter(x => x !== r));
                    }
                  }}
                  className="mr-1"
                />
                {r}
              </label>
            ))}
          </div>
        </div>
        {/* 學費範圍 */}
        <div>
          <label className="block text-sm font-medium mb-1">學費範圍 (HK$)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={PRICE_MIN}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-16 px-1 border rounded"
            />
            <span>-</span>
            <input
              type="number"
              min={priceRange[0]}
              max={PRICE_MAX}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-16 px-1 border rounded"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 