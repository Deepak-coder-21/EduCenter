import React from 'react';
import { useGetSettingsQuery } from '../features/api/authApi';

const defaultAbout = {
  heroTitle: 'Dedicated to Nurturing the Future of Bihar',
  heroSubtitle: 'We are EduCenter, a team of passionate educators committed to providing high-quality, accessible education to students everywhere.',
  storyTitle: 'Our Story',
  storyParagraph1: 'EduCenter was born from a simple yet powerful idea: every student in Madhubani, and across Bihar, deserves access to the best educational resources, regardless of their location. Our founder, a former student from this very region, understood the challenges of preparing for competitive exams with limited local resources.',
  storyParagraph2: 'Fueled by a passion to give back to the community, we started in 2022 as a small initiative to share notes and video tutorials online. The overwhelming positive response from students inspired us to build this comprehensive platform. Today, EduCenter is a growing online hub for learning, dedicated to empowering students to achieve their dreams and build a brighter future for themselves and our state.',
  storyImage: 'https://placehold.co/600x400/A5B4FC/3730A3?text=Our+Journey',
  missionText: 'To provide affordable, high-quality digital education and mentorship to students, breaking down geographical barriers and creating a level playing field for all.',
  visionText: 'To be the most trusted and effective online learning platform for students in Bihar and beyond, recognized for our commitment to student success and educational excellence.',
};

function AboutUs() {
  const { data } = useGetSettingsQuery();
  const about = {
    ...defaultAbout,
    ...(data?.settings?.about || {}),
  };

  return (
    <>
      <header
        className="bg-cover bg-center"
        style={{
          backgroundImage: "url('https://placehold.co/1920x800/4338CA/FFFFFF?text=Our+Story')"
        }}
      >
        <div className="bg-black bg-opacity-60 min-h-[50vh] flex items-center justify-center">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {about.heroTitle}
            </h1>
            <p className="text-lg md:text-xl mt-6 text-gray-200 max-w-3xl mx-auto">
              {about.heroSubtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="py-16">
        {/* Our Story */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="prose lg:prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{about.storyTitle}</h2>
              <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                {about.storyParagraph1}
              </p>
              {about.storyParagraph2 && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {about.storyParagraph2}
                </p>
              )}
            </div>
            <div>
              <img
                src={about.storyImage || 'https://placehold.co/600x400/A5B4FC/3730A3?text=Our+Journey'}
                alt={about.storyTitle}
                className="rounded-2xl shadow-xl w-full object-cover max-h-[420px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400/A5B4FC/3730A3?text=Our+Journey';
                }}
              />
            </div>
          </div>
        </section>

        {/* Mission and Vision */}
        <section className="bg-indigo-50 py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 text-center">
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                <div className="text-indigo-600 text-5xl mb-4"><i className="fas fa-rocket"></i></div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {about.missionText}
                </p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                <div className="text-indigo-600 text-5xl mb-4"><i className="far fa-eye"></i></div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {about.visionText}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Instructors */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">Meet Our Expert Instructors</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Our team is our greatest asset. Learn from dedicated professionals who are experts in their fields.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Prof. Sameer Ahmed',
                  title: 'M.Sc. Physics, IIT Delhi',
                  img: 'https://placehold.co/128x128/C7D2FE/4338CA?text=SA',
                  bio: 'With over 12 years of teaching experience, Sameer sir makes complex physics concepts easy to understand. He is our lead instructor for Physics and Mathematics.',
                },
                {
                  name: 'Dr. Anjali Mishra',
                  title: 'Ph.D. in Chemistry, Patna University',
                  img: 'https://placehold.co/128x128/FBCFE8/831843?text=AM',
                  bio: 'Anjali ma\'am is passionate about making Chemistry exciting. Her expertise in organic and inorganic chemistry helps students build a strong foundation for medical and engineering exams.',
                },
                {
                  name: 'Mr. Rajesh Kumar',
                  title: 'M.A. in History, JNU',
                  img: 'https://placehold.co/128x128/A7F3D0/065F46?text=RK',
                  bio: 'Rajesh sir brings history to life with his engaging storytelling. He specializes in modern history and is a mentor for students preparing for civil services and other competitive exams.',
                }
              ].map((instructor, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <img src={instructor.img} alt={instructor.name} className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-indigo-50 object-cover shadow" />
                  <h3 className="text-xl font-semibold text-indigo-700">{instructor.name}</h3>
                  <p className="text-gray-500 font-medium mb-3 text-sm">{instructor.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{instructor.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default AboutUs;