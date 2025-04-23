import Image from 'next/image';

const courses = [
  {
    id: 1,
    title: '中學補習',
    subtitle: '針對性提升學科成績',
    icon: '📚'
  },
  {
    id: 2,
    title: '語言學習',
    subtitle: '提升語言能力與溝通技巧',
    icon: '🌍'
  },
  {
    id: 3,
    title: '音樂課程',
    subtitle: '專業音樂教育與指導',
    icon: '🎵'
  },
  {
    id: 4,
    title: '運動課程',
    subtitle: '專業運動訓練與指導',
    icon: '⚽'
  }
];

const CourseSection = () => {
  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-lg mb-3 border-b-2 border-primary inline-block">
          課程分類
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-yellow-50 p-4 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200"
            >
              <div className="text-4xl mb-3 text-center">{course.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-center">{course.title}</h3>
              <p className="text-sm text-gray-600 text-center">{course.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection; 