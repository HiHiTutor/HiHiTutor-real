'use client';

import React, { useEffect, useState } from 'react';
import { caseApi } from '@/services/api';
import CaseCard from '@/components/CaseCard';



export default function FindTutorCasesPage() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    console.log('📍 useEffect triggered – 正在 fetch 學生個案');

    caseApi.getAllStudentCases()
      .then((result) => {
        console.log('📦 getAllStudentCases response:', result);
        if (result.success && result.data) {
          setCases(result.data);
        } else {
          console.warn('⚠️ getAllStudentCases returned empty or error:', result);
        }
      })
      .catch((err) => {
        console.error('❌ getAllStudentCases 發生錯誤:', err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">📄 補習個案（學生出Post）</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {cases.length === 0 && <p>😢 暫時無個案</p>}
        {cases.map((c: any, index: number) => {
          console.log(`🧩 渲染個案 #${index}:`, c);
          return <CaseCard key={c.id || index} data={c} />;
        })}
      </div>
    </div>
  );
} 