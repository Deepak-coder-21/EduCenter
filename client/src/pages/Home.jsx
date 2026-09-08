import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <header className="hero-bg text-white bg-cover bg-center" style={{ backgroundImage: `url('https://placehold.co/1920x1080/E0E7FF/4F46E5?text=Inspiring+Learning+Environment')` }}>
        <div className="bg-black bg-opacity-50 min-h-[80vh] flex items-center">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Unlock Your Potential: Expert Coaching, Anytime, Anywhere.
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
              Access high-quality video lectures, comprehensive notes, practice questions, and expert Q&A to achieve your academic goals.
            </p>
            <Link to="/courses" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg text-lg shadow-lg">
              Explore Our Courses
            </Link>
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

      <section className="py-16 bg-white">
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