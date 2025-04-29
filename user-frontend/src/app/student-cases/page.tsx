'use client';

import { useEffect, useState } from 'react';

export default function StudentCasesPage() {
  const [studentCases, setStudentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/find-tutor-cases');
        if (response.ok) {
          const data = await response.json();
          setStudentCases(data);
          console.log('Fetched student cases:', data);
        } else {
          console.error('Failed to fetch student cases');
        }
      } catch (error) {
        console.error('Error fetching student cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  console.log('studentCases state:', studentCases);

  const handleApply = async (caseId: string) => {
    // 這裡可以實作申請 API
    console.log(`Applying for case: ${caseId}`);
    // 例如: await fetch(`http://localhost:3001/api/apply/${caseId}`, { method: 'POST' });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📄</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">最新學生搵導師個案</h2>
      </div>
      <div className="space-y-6">
        {studentCases.map((caseItem) => (
          <div key={caseItem.id} className="bg-blue-100 border border-blue-300 rounded-xl p-6">
            <p className="text-gray-600">ID: {caseItem.id}</p>
            <p className="text-gray-600">科目: {caseItem.subject}</p>
            <p className="text-gray-600">地點: {caseItem.location}</p>
            <p className="text-gray-600">收費: {caseItem.budget}</p>
            <p className="text-gray-600">模式: {caseItem.mode}</p>
            <p className="text-gray-600">要求: {caseItem.requirement}</p>
            <button
              onClick={() => handleApply(caseItem.id)}
              className="mt-4 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              申請此個案
            </button>
          </div>
        ))}
      </div>
    </section>
  );
} 