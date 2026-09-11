import React from 'react';
import { useGetSettingsQuery } from '../features/api/authApi';

const defaultAbout = {
  heroTitle: 'Dedicated to Nurturing the Future of Bihar',
  heroSubtitle: 'We are EduCenter, a team of passionate educators committed to providing high-quality, accessible education to students everywhere.',
  storyTitle: 'Our Story',
  storyParagraph1: 'EduCenter was born from a simple yet powerful idea: every student in Madhubani, and across Bihar, deserves access to the best educational resources, regardless of their location. Our founder, a former student from this very region, understood the challenges of preparing for competitive exams with limited local resources.',
  storyParagraph2: 'Fueled by a passion to give back to the community, we started in 2022 as a small initiative to share notes and video tutorials online. The overwhelming positive response from students inspired us to build this comprehensive platform. Today, EduCenter is a growing online hub for learning, dedicated to empowering students to achieve their dreams and build a brighter future for themselves and our state.',
  storyImage: '/images/our_journey_story.jpg',
  missionText: 'To provide affordable, high-quality digital education and mentorship to students, breaking down geographical barriers and creating a level playing field for all.',
  visionText: 'To be the most trusted and effective online learning platform for students in Bihar and beyond, recognized for our commitment to student success and educational excellence.',
};

function AboutUs() {
  const { data } = useGetSettingsQuery();
  const about = {
    ...defaultAbout,
    ...(data?.settings?.about || {}),
  };

  const storyImgSrc = (about.storyImage && !about.storyImage.includes('placehold.co'))
    ? about.storyImage
    : '/images/our_journey_story.jpg';

  return (
    <>
      <header
        className="bg-cover bg-center relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/home_hero_bg.jpg')"
        }}
      >
        <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900/85 to-indigo-950/90 min-h-[48vh] flex items-center justify-center">
          <div className="container mx-auto px-6 py-16 text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm">
              <i className="fas fa-heart text-pink-400"></i> Empowering Learners
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto">
              {about.heroTitle}
            </h1>
            <p className="text-lg md:text-xl mt-6 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              {about.heroSubtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="py-16">
        {/* Our Story */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="prose lg:prose-lg max-w-none">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Our Journey
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-4">{about.storyTitle}</h2>
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
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <img
                  src={storyImgSrc}
                  alt={about.storyTitle}
                  className="relative rounded-2xl shadow-xl w-full object-cover max-h-[440px] border border-gray-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/our_journey_story.jpg';
                  }}
                />
              </div>
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  name: 'Prof. Sameer Ahmed',
                  title: 'M.Sc. Physics, IIT Delhi',
                  badge: 'Lead Physics & Math',
                  img: '/images/instructor_sameer.jpg',
                  bio: 'With over 12 years of teaching experience, Sameer sir makes complex physics concepts easy to understand. He is our lead instructor for Physics and Mathematics.',
                },
                {
                  name: 'Dr. Anjali Mishra',
                  title: 'Ph.D. in Chemistry, Patna University',
                  badge: 'Senior Chemistry Faculty',
                  img: '/images/instructor_anjali.jpg',
                  bio: 'Anjali ma\'am is passionate about making Chemistry exciting. Her expertise in organic and inorganic chemistry helps students build a strong foundation for competitive exams.',
                },
                {
                  name: 'Mr. Rajesh Kumar',
                  title: 'M.A. in History, JNU',
                  badge: 'Humanities & Mentorship',
                  img: '/images/instructor_rajesh.jpg',
                  bio: 'Rajesh sir brings history to life with his engaging storytelling. He specializes in modern history and is a dedicated mentor for students preparing for competitive exams.',
                }
              ].map((instructor, i) => (
                <div key={i} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 p-7 text-center transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center">
                  <div className="relative mb-5">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-indigo-50 shadow-md group-hover:ring-indigo-100 transition duration-300">
                      <img
                        src={instructor.img}
                        alt={instructor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/instructor_sameer.jpg';
                        }}
                      />
                    </div>
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-sm whitespace-nowrap">
                      {instructor.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition mt-2">{instructor.name}</h3>
                  <p className="text-indigo-600/90 font-medium mb-3 text-xs tracking-wide">{instructor.title}</p>
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