import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <header
        className="hero-bg text-white bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/images/home_hero_bg.jpg')" }}
      >
        <div className="bg-gradient-to-r from-slate-950/90 via-indigo-950/85 to-slate-950/85 min-h-[85vh] flex items-center">
          <div className="container mx-auto px-6 py-20 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm shadow-sm">
              <i className="fas fa-graduation-cap text-indigo-400"></i> Premier Online Learning Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight max-w-4xl mx-auto drop-shadow-sm">
              Unlock Your Potential: Expert Coaching,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
                Anytime, Anywhere.
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-slate-200 leading-relaxed font-normal">
              Access high-quality video lectures, comprehensive notes, practice questions, and expert Q&A to achieve your academic goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition duration-200 flex items-center justify-center gap-2"
              >
                <span>Explore Our Courses</span>
                <i className="fas fa-arrow-right text-sm"></i>
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg backdrop-blur-md transition duration-200 flex items-center justify-center gap-2"
              >
                <span>Meet Our Team</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-8 border-t border-white/15 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 text-lg">
                  <i className="fas fa-video"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-white leading-tight">100+</div>
                  <div className="text-xs text-slate-300 font-medium">HD Lectures</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400 text-lg">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-white leading-tight">5,000+</div>
                  <div className="text-xs text-slate-300 font-medium">Active Students</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-lg">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-white leading-tight">Free</div>
                  <div className="text-xs text-slate-300 font-medium">Study Notes</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-lg">
                  <i className="fas fa-star"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-white leading-tight">4.9 / 5</div>
                  <div className="text-xs text-slate-300 font-medium">Rating Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose EduCenter?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'fa-video', title: 'Expert-Led Video Lectures', desc: 'Engaging and easy-to-understand video content from experienced educators.' },
              { icon: 'fa-file-alt', title: 'Comprehensive Study Notes', desc: 'Download detailed notes and resources curated by subject matter experts.' },
              { icon: 'fa-question-circle', title: 'Extensive Question Banks', desc: 'Practice with a wide variety of questions and get instant feedback.' },
              { icon: 'fa-brain', title: '✨ AI Study Tools', desc: 'Get personalized AI-generated study plans to optimize your learning.' }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 rounded-lg shadow-md">
                <div className="text-indigo-500 text-4xl mb-4"><i className={`fas ${item.icon}`}></i></div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey Preview Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <img
                src="/images/our_journey_story.jpg"
                alt="Our Educational Journey"
                className="relative rounded-2xl shadow-xl w-full object-cover max-h-[420px] border border-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/home_hero_bg.jpg';
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <i className="fas fa-award"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Empowering Students</h4>
                    <p className="text-xs text-gray-500">Quality education for all</p>
                  </div>
                </div>
                <Link to="/about" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                  Read Story &rarr;
                </Link>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-3 py-1 rounded-full">
                Our Mission & Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
                Dedicated to Nurturing the Future of Bihar & Beyond
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                EduCenter was born from a simple yet powerful vision: every student deserves access to top-tier coaching, mentorship, and study materials, regardless of location.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Comprehensive syllabus coverage with HD video lectures',
                  'Downloadable curated study notes and practice materials',
                  'Dedicated mentorship by experienced subject specialists',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 font-medium text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                      <i className="fas fa-check"></i>
                    </div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 text-sm"
              >
                <span>Learn More About Us</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Instructors Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Faculty & Mentors
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              Learn From Leading Subject Experts
            </h2>
            <p className="text-gray-600 text-base">
              Our instructors bring decades of teaching excellence and proven success in competitive examinations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Prof. Sameer Ahmed',
                title: 'M.Sc. Physics, IIT Delhi',
                badge: 'Lead Physics & Math',
                img: '/images/instructor_sameer.jpg',
                bio: '12+ years making complex physics intuitive and accessible through structured problem-solving.',
              },
              {
                name: 'Dr. Anjali Mishra',
                title: 'Ph.D. in Chemistry, Patna University',
                badge: 'Senior Chemistry Faculty',
                img: '/images/instructor_anjali.jpg',
                bio: 'Specialist in organic and inorganic chemistry, guiding students towards top medical & engineering ranks.',
              },
              {
                name: 'Mr. Rajesh Kumar',
                title: 'M.A. in History, JNU',
                badge: 'Humanities & Mentorship',
                img: '/images/instructor_rajesh.jpg',
                bio: 'Brings history and general studies to life with captivating narrative analysis and exam strategies.',
              },
            ].map((instructor, i) => (
              <div
                key={i}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 p-7 text-center transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center"
              >
                <div className="relative mb-5">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-indigo-50 shadow-md group-hover:ring-indigo-100 transition duration-300">
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
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition mt-2">
                  {instructor.name}
                </h3>
                <p className="text-indigo-600 font-medium mb-3 text-xs">{instructor.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{instructor.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t border-slate-200/60">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Start Learning in 3 Simple Steps</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: 'fa-user-plus', title: '1. Sign Up / Register', desc: 'Create your free account to get started and explore our platform.' },
              { icon: 'fa-book-open', title: '2. Choose Your Course', desc: 'Browse our catalog and enroll in the subjects that match your learning goals.' },
              { icon: 'fa-laptop-code', title: '3. Learn & Practice', desc: 'Access videos, notes, and quizzes to begin your educational journey.' }
            ].map((item, idx) => (
              <div key={idx} className="p-6">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-3xl">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            {isAuthenticated
              ? "Continue your learning journey with our full catalog of expert-led courses."
              : "Join thousands of successful students. Sign up today for free access to select resources or explore our full course catalog."}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link to="/signup" className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 shadow-lg transition">
                  Sign Up for Free
                </Link>
                <Link to="/courses" className="border-2 border-white hover:bg-white hover:text-indigo-600 font-semibold px-8 py-4 rounded-lg text-lg shadow-lg transition">
                  Explore All Courses
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 shadow-lg transition">
                  Go to Dashboard
                </Link>
                <Link to="/courses" className="border-2 border-white hover:bg-white hover:text-indigo-600 font-semibold px-8 py-4 rounded-lg text-lg shadow-lg transition">
                  Explore All Courses
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;