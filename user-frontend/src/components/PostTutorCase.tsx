'use client';

import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { CATEGORY_OPTIONS, CategoryOption } from './CaseFilterBar';

interface PostTutorCaseProps {
  onSubmit: (data: any) => void;
}

interface FormData {
  category: string;
  subjects: string[];
  title: string;
  description: string;
  price: string;
  location: string;
  contact: string;
}

export default function PostTutorCase({ onSubmit }: PostTutorCaseProps) {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    subjects: [],
    title: '',
    description: '',
    price: '',
    location: '',
    contact: ''
  });

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value,
      subjects: [] // 重置科目選擇
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getCategorySubjects = () => {
    const category = CATEGORY_OPTIONS.find((c: CategoryOption) => c.value === formData.category);
    return category?.subjects || [];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">課程分類</label>
        <Listbox value={formData.category} onChange={handleCategoryChange}>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300">
              <span className="block truncate">
                {formData.category ? CATEGORY_OPTIONS.find((opt: CategoryOption) => opt.value === formData.category)?.label : '選擇課程分類'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {CATEGORY_OPTIONS.map((category: CategoryOption) => (
                <Listbox.Option
                  key={category.value}
                  value={category.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {category.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {formData.category && (
        <div>
          <label className="block text-sm font-medium text-gray-700">科目（可多選）</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {getCategorySubjects().map((subject: { value: string; label: string }) => (
              <label key={subject.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subject.value)}
                  onChange={() => handleSubjectChange(subject.value)}
                  className="rounded-lg border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-300"
                />
                <span className="ml-2 text-sm text-gray-700">{subject.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">標題</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">學費（每堂）</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">地點</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">聯絡方式</label>
        <input
          type="text"
          value={formData.contact}
          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition"
        >
          發布
        </button>
      </div>
    </form>
  );
} 