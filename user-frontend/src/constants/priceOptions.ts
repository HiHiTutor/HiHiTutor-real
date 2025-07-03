export interface PriceOption {
  value: string;
  label: string;
  min?: number;
  max?: number | null;
}

export const PRICE_OPTIONS: PriceOption[] = [
  { 
    value: 'unlimited', 
    label: '不限'
  },
  { 
    value: '0-100', 
    label: 'HK$ 100 或以下',
    min: 0,
    max: 100
  },
  { 
    value: '101-300', 
    label: 'HK$ 101 - HK$ 300',
    min: 101,
    max: 300
  },
  { 
    value: '301-500', 
    label: 'HK$ 301 - HK$ 500',
    min: 301,
    max: 500
  },
  { 
    value: '501-1000', 
    label: 'HK$ 501 - HK$ 1,000',
    min: 501,
    max: 1000
  },
  { 
    value: '1001+', 
    label: 'HK$ 1,001 或以上',
    min: 1001,
    max: null
  }
];

export default PRICE_OPTIONS; 