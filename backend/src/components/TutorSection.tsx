import Image from 'next/image';

const tutors = [
  {
    id: 1,
    tutorId: 'TUTOR001',
    name: '王老師',
    subject: '數學',
    rating: 4.9,
    reviews: 128,
    image: '/avatars/teacher1.png',
    tags: ['中學數學', 'DSE', 'IB'],
    experience: '5年',
    price: '$300/小時'
  },
  {
    id: 2,
    tutorId: 'TUTOR002',
    name: '李老師',
    subject: '英語',
    rating: 4.8,
    reviews: 156,
    image: '/avatars/teacher2.png',
    tags: ['英語會話', 'IELTS', 'TOEFL'],
    experience: '8年',
    price: '$350/小時'
  },
  {
    id: 3,
    tutorId: 'TUTOR003',
    name: '陳老師',
    subject: '物理',
    rating: 4.7,
    reviews: 98,
    image: '/avatars/teacher3.png',
    tags: ['高中物理', 'AP Physics', 'IB Physics'],
    experience: '6年',
    price: '$320/小時'
  },
  {
    id: 4,
    tutorId: 'TUTOR004',
    name: '張老師',
    subject: '化學',
    rating: 4.9,
    reviews: 112,
    image: '/avatars/teacher4.png',
    tags: ['高中化學', 'DSE', 'A-Level'],
    experience: '7年',
    price: '$330/小時'
  }
];

const TutorSection = () => {
  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-lg mb-3 border-b-2 border-primary inline-block">
          精選導師
        </h2>
        <div className="bg-blue-50 border border-primary p-4 rounded-xl mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-48 w-full mb-4">
                  <Image
                    src={tutor.image}
                    alt={tutor.tutorId}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{tutor.tutorId}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm">{tutor.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{tutor.subject}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>教學年資: {tutor.experience}</span>
                    <span>{tutor.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tutor.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200">
              查看更多導師
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorSection; 