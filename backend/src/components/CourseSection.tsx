import Image from 'next/image';

const courses = [
  {
    id: 1,
    title: '中學補習',
    subtitle: 'DSE、IB、A-Level',
    icon: '/icons/school.png'
  },
  {
    id: 2,
    title: '語言學習',
    subtitle: '英語、日語、韓語',
    icon: '/icons/language.png'
  },
  {
    id: 3,
    title: '音樂課程',
    subtitle: '鋼琴、小提琴、吉他',
    icon: '/icons/music.png'
  },
  {
    id: 4,
    title: '運動課程',
    subtitle: '游泳、網球、籃球',
    icon: '/icons/sports.png'
  }
];

const CourseSection = () => {
  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-lg mb-3 border-b-2 border-primary inline-block">
          課程分類
        </h2>
        <div className="bg-yellow-50 rounded-2xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white shadow-sm p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-16 w-16 mx-auto mb-3">
                  <Image
                    src={course.icon}
                    alt={course.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseSection; 