import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMyEnrolledCoursesQuery } from '../features/api/authApi';

function MyLearning() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetMyEnrolledCoursesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrolledCourses = data?.courses || [];

  return (
    <main className="py-16 bg-gray-50/50 min-h-[85vh]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Student Classroom
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            My Learning & Enrolled Courses
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Access your purchased courses, continue watching video lectures, and track your progress.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Login to View Courses</h2>
            <p className="text-sm text-gray-600 mb-6">
              Please sign in to access your enrolled courses and lecture playlists.
            </p>
            <Link
              to="/login"
              className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
            >
              Sign In Now
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading your enrolled courses...</p>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                You are enrolled in {enrolledCourses.length} course{enrolledCourses.length > 1 ? 's' : ''}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => {
                const id = course._id || course.id;
                const title = course.courseTitle || course.title;
                const image =
                  course.courseThumbnail ||
                  course.image ||
                  'https://placehold.co/600x400/A5B4FC/3730A3?text=Course';
                const instructor = course.creator?.name || 'Prof. Sameer Ahmed';
                const lectureCount = course.lectures?.length || 0;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden transition duration-300 border border-gray-100 flex flex-col group"
                  >
                    <div className="relative">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Course';
                        }}
                      />
                      <span className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                        <i className="fas fa-check-circle text-[10px]"></i> Enrolled
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">
                        {course.category || 'Curriculum'}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">by {instructor}</p>

                      <div className="mt-auto space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-video text-indigo-500"></i>
                            {lectureCount} {lectureCount === 1 ? 'Lesson' : 'Lessons'}
                          </span>
                          <span className="font-semibold text-emerald-600">Full Access</span>
                        </div>

                        <Link
                          to={`/course/${id}`}
                          className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-play text-xs"></i>
                          <span>Continue Learning</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Enrolled Courses Yet</h2>
            <p className="text-sm text-gray-600 mb-6">
              Start your learning journey by exploring courses and watching free preview lessons today!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 text-sm"
            >
              <span>Explore Courses</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyLearning;
