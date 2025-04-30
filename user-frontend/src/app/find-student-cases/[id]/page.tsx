'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Case {
  id: string;
  category: string;
  subCategory: string;
  subjects: string[];
  region: string;
  subRegion: string;
  mode: string;
  budget: {
    min: number;
    max: number;
  };
  experience: string;
  date: string;
}

// 地區映射
const REGIONS: { [key: string]: string } = {
  'hong-kong-island': '香港島',
  'kowloon': '九龍',
  'new-territories': '新界',
  'islands': '離島'
};

// 子地區映射
const SUB_REGIONS: { [key: string]: { [key: string]: string } } = {
  'hong-kong-island': {
    'central-western': '中西區',
    'wan-chai': '灣仔區',
    'eastern': '東區',
    'southern': '南區'
  },
  'kowloon': {
    'yau-tsim-mong': '油尖旺區',
    'sham-shui-po': '深水埗區',
    'kowloon-city': '九龍城區',
    'wong-tai-sin': '黃大仙區',
    'kwun-tong': '觀塘區'
  },
  'new-territories': {
    'kwai-tsing': '葵青區',
    'tuen-mun': '屯門區',
    'yuen-long': '元朗區',
    'north': '北區',
    'tai-po': '大埔區',
    'sha-tin': '沙田區',
    'sai-kung': '西貢區'
  },
  'islands': {
    'islands': '離島區'
  }
};

// 類別映射
const CATEGORIES: { [key: string]: string } = {
  'preschool': '幼兒教育',
  'primary-secondary': '中小學教育',
  'tertiary': '大專補習課程',
  'interest': '興趣班',
  'adult': '成人教育'
};

// 子類別映射
const SUB_CATEGORIES: { [key: string]: { [key: string]: string } } = {
  'preschool': {
    '': '幼兒教育'
  },
  'primary-secondary': {
    'primary': '小學',
    'secondary': '中學'
  },
  'tertiary': {
    'undergraduate': '大學本科',
    'postgraduate': '研究生'
  },
  'interest': {
    '': '興趣班'
  },
  'adult': {
    '': '成人教育'
  }
};

// 科目映射
const SUBJECTS: { [key: string]: { [key: string]: string } } = {
  'preschool': {
    'preschool-chinese': '中文',
    'preschool-english': '英文',
    'preschool-math': '數學'
  },
  'primary': {
    'primary-chinese': '中文',
    'primary-english': '英文',
    'primary-math': '數學',
    'primary-general': '常識',
    'primary-stem': 'STEM'
  },
  'secondary': {
    'secondary-chinese': '中文',
    'secondary-english': '英文',
    'secondary-math': '數學',
    'secondary-ls': '通識',
    'secondary-humanities': '人文學科',
    'secondary-economics': '經濟',
    'secondary-computer': '電腦',
    'secondary-dse': 'DSE',
    'secondary-all': '全科'
  },
  'undergraduate': {
    'undergraduate-calculus': '微積分',
    'undergraduate-economics': '經濟學',
    'undergraduate-statistics': '統計學',
    'undergraduate-accounting': '會計學',
    'undergraduate-programming': '程式設計',
    'undergraduate-language': '語言課程'
  },
  'postgraduate': {
    'postgraduate-thesis': '論文寫作',
    'postgraduate-research': '研究方法',
    'postgraduate-spss': 'SPSS',
    'postgraduate-presentation': '學術簡報'
  },
  'interest': {
    'interest-music': '音樂',
    'interest-art': '藝術',
    'interest-programming': '程式設計',
    'interest-language': '語言'
  },
  'adult': {
    'adult-business': '商業英語',
    'adult-language': '語言課程',
    'adult-workplace': '職場技能'
  }
};

// 教學模式映射
const MODES: { [key: string]: string } = {
  'online': '網課',
  'offline': '面授'
};

// 經驗要求映射
const EXPERIENCES: { [key: string]: string } = {
  'fresh': '無經驗要求',
  'junior': '1-3年經驗',
  'senior': '3-5年經驗',
  'expert': '5年以上經驗'
};

export default function FindStudentCaseDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setUserType(localStorage.getItem('userType'));
    const fetchCase = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/find-student-cases/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCaseDetail(data);
        } else {
          setCaseDetail(null);
        }
      } catch (error) {
        setCaseDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!caseDetail) return <div>此個案未找到或已被刪除。</div>;

  const handleApply = async () => {
    if (userType !== 'tutor') {
      setShowError(true);
      return;
    }
    setShowError(false);
    console.log(`Applying for case: ${id}`);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 獲取科目中文名稱
  const getSubjectNames = (subjects: string[], category: string, subCategory: string) => {
    const subjectMap = SUBJECTS[subCategory] || SUBJECTS[category] || {};
    return subjects.map(subject => subjectMap[subject] || subject).join('、');
  };

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">精選導師個案</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-8">
        <p className="text-gray-600">個案 ID：{caseDetail.id}</p>
        <p className="text-gray-600">科目：{getSubjectNames(caseDetail.subjects, caseDetail.category, caseDetail.subCategory)}</p>
        <p className="text-gray-600">地點：{REGIONS[caseDetail.region]} {SUB_REGIONS[caseDetail.region]?.[caseDetail.subRegion]}</p>
        <p className="text-gray-600">
          收費：
          {typeof caseDetail.budget === 'object' && caseDetail.budget !== null
            ? `${caseDetail.budget.min} - ${caseDetail.budget.max}/小時`
            : '價格待議'}
        </p>
        <p className="text-gray-600">模式：{MODES[caseDetail.mode] || caseDetail.mode}</p>
        <p className="text-gray-600">要求：{EXPERIENCES[caseDetail.experience] || caseDetail.experience}</p>
        <div>
          <button
            onClick={handleApply}
            className="mt-4 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            申請此個案
          </button>
          {showError && (
            <div className="mt-4 text-red-600">需要升級為導師才可申請此個案</div>
          )}
        </div>
      </div>
    </section>
  );
} 