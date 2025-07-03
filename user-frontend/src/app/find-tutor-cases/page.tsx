'use client';

import React, { useEffect, useState } from 'react';
import { caseApi } from '@/services/api';
import StudentCaseCard from '@/components/student/StudentCaseCard';

export default function FindTutorCasesPage() {
  console.log('🧠 TRACE: src/app/find-tutor-cases/page.tsx 被正確使用 ✅');
  console.log('🧠 [Trace] ✅ 你而家用緊 src/app/find-tutor-cases/page.tsx 呢個 Component');
  console.log('💥 進入 page.tsx: /find-tutor-cases ✅');

  const [cases, setCases] = useState([]);

  useEffect(() => {
    console.log('🧪 useEffect 開始執行: 準備呼叫 searchByTarget("find-tutor")');

    caseApi.searchByTarget('find-tutor')
      .then((res) => {
        console.log('🎯 收到補習個案 API 回應:', res);
        if (res.success && res.data && res.data.cases) {
          setCases(res.data.cases);
        } else {
          console.warn('⚠️ 回傳結果無資料或失敗:', res);
        }
      })
      .catch((err) => {
        console.error('❌ 呼叫 searchByTarget("find-tutor") 發生錯誤:', err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">📄 補習個案（導師出 Post）</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {cases.length === 0 && <p>😢 暫時無個案</p>}
        {cases.map((studentCase: any, index: number) => (
          <StudentCaseCard key={studentCase.id || index} case={studentCase} />
        ))}
      </div>
    </div>
  );
} 