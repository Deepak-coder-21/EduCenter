import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useGetMyEnrolledCoursesQuery,
  useGetMyPurchasesQuery,
  useGetCoursesQuery,
  useLoadUserQuery,
} from '../features/api/authApi';

function Dashboard() {
  const { isAuthenticated, user: authUser } = useSelector((state) => state.auth);
  const { data: userData } = useLoadUserQuery(undefined, { skip: !isAuthenticated });
  const user = userData?.user || authUser;

  // Active Tab State: 'courses' | 'explore' | 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');

  // API Queries
  const {
    data: enrolledData,
    isLoading: isEnrolledLoading,
    refetch: refetchEnrolled,
  } = useGetMyEnrolledCoursesQuery(undefined, { skip: !isAuthenticated });

  const {
    data: purchasesData,
    isLoading: isPurchasesLoading,
  } = useGetMyPurchasesQuery(undefined, { skip: !isAuthenticated });

  const { data: allCoursesData, isLoading: isAllCoursesLoading } = useGetCoursesQuery({
    isPublished: true,
  });

  const enrolledCourses = enrolledData?.courses || [];
  const purchases = purchasesData?.purchases || [];
  const allCourses = allCoursesData?.courses || [];

  // Filter out already enrolled courses for the "Explore" tab
  const enrolledIds = new Set(enrolledCourses.map((c) => (c._id || c.id)?.toString()));
  const recommendedCourses = allCourses.filter(
    (c) => !enrolledIds.has((c._id || c.id)?.toString())
  );

  // Filter enrolled courses by search
  const filteredEnrolledCourses = enrolledCourses.filter((course) => {
    const title = course.courseTitle || course.title || '';
    const cat = course.category || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate total lectures across all enrolled courses
  const totalLecturesCount = enrolledCourses.reduce(
    (acc, curr) => acc + (curr.lectures?.length || 0),
    0
  );

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!isAuthenticated) {
    return (
      <main className="py-20 bg-gray-50/70 min-h-[85vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fas fa-user-lock"></i>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Student Portal Access</h1>
            <p className="text-sm text-gray-600 mt-2">
              Please sign in to access your personal dashboard, enrolled courses, and video lectures.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Link
              to="/login"
              className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition text-sm text-center"
            >
              Sign In to Your Account
            </Link>
            <Link
              to="/signup"
              className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition text-sm text-center"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14 bg-gray-50/60 min-h-[90vh]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-8">
        {/* ================= HERO WELCOME BANNER ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <img
                  src={user?.photoUrl || 'https://placehold.co/100x100/E0E7FF/4F46E5?text=Student'}
                  alt={user?.name || 'User Profile'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/100x100/E0E7FF/4F46E5?text=Student';
                  }}
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-indigo-900 rounded-full flex items-center justify-center text-[9px] text-white">
                  <i className="fas fa-check"></i>
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    {getGreeting()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {user?.role || 'Student'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  {user?.name || 'Student'}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200/80 mt-0.5 flex items-center gap-2">
                  <i className="far fa-envelope"></i>
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                to="/courses"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold text-xs sm:text-sm shadow-md transition"
              >
                <i className="fas fa-compass"></i>
                <span>Explore Courses</span>
              </Link>
              <Link
                to="/edit-profile"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-xs sm:text-sm text-white transition"
              >
                <i className="fas fa-user-edit"></i>
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: Enrolled Courses */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                My Courses
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                <i className="fas fa-graduation-cap"></i>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {enrolledCourses.length}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Active enrollments</p>
            </div>
          </div>

          {/* Stat 2: Total Video Lessons */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Video Lessons
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i className="fas fa-play-circle"></i>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {totalLecturesCount}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Total accessible videos</p>
            </div>
          </div>

          {/* Stat 3: Orders & Purchases */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Completed Orders
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                <i className="fas fa-receipt"></i>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {purchases.length}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Transactions & Invoices</p>
            </div>
          </div>

          {/* Stat 4: Learning Status */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Account Status
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                <i className="fas fa-award"></i>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                Active
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Verified Student</p>
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION TABS ================= */}
        <div className="bg-white rounded-2xl p-1.5 border border-gray-200/80 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-book-reader"></i>
            <span>My Courses ({enrolledCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-compass"></i>
            <span>Explore Courses ({recommendedCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-file-invoice-dollar"></i>
            <span>Order History ({purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-user-circle"></i>
            <span>Profile & Info</span>
          </button>
        </div>

        {/* ================= TAB 1: MY ENROLLED COURSES ================= */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Enrolled Course Playlists
                </h2>
                <p className="text-xs text-gray-500">
                  Select any course to continue watching your video lessons.
                </p>
              </div>

              {enrolledCourses.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input
                    type="text"
                    placeholder="Search enrolled courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  />
                </div>
              )}
            </div>

            {isEnrolledLoading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
                <p className="text-sm text-gray-500">Loading your courses...</p>
              </div>
            ) : filteredEnrolledCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEnrolledCourses.map((course) => {
                  const id = course._id || course.id;
                  const title = course.courseTitle || course.title;
                  const image =
                    course.courseThumbnail ||
                    course.image ||
                    'https://placehold.co/600x400/A5B4FC/3730A3?text=EduCenter+Course';
                  const instructor = course.creator?.name || 'Prof. Sameer Ahmed';
                  const lectureCount = course.lectures?.length || 0;

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden transition duration-300 border border-gray-100 flex flex-col group"
                    >
                      <div className="relative overflow-hidden aspect-video">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Course';
                          }}
                        />
                        <span className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                          <i className="fas fa-check-circle text-[10px]"></i> Enrolled
                        </span>
                        {course.category && (
                          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-indigo-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                            {course.category}
                          </span>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 mb-4 flex items-center gap-1.5">
                          <i className="fas fa-chalkboard-teacher text-indigo-500"></i>
                          <span>{instructor}</span>
                        </p>

                        <div className="mt-auto space-y-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <i className="fas fa-video text-indigo-600"></i>
                              <strong>{lectureCount}</strong> Video Lectures
                            </span>
                            <span className="font-bold text-emerald-600">Unlocked</span>
                          </div>

                          <Link
                            to={`/course/${id}`}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition text-xs sm:text-sm text-center flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-play text-xs"></i>
                            <span>Watch Lessons</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Enrolled Courses Yet</h3>
                <p className="text-xs text-gray-600 mt-1 mb-6">
                  You haven't enrolled in any courses yet. Explore our curriculum to get started with free preview lessons!
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition inline-flex items-center gap-2"
                >
                  <i className="fas fa-search"></i>
                  <span>Browse Available Courses</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500">No enrolled courses match your search "{searchQuery}".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: EXPLORE NEW COURSES ================= */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Recommended Courses For You
              </h2>
              <p className="text-xs text-gray-500">
                Expand your skills with new certified courses from top instructors.
              </p>
            </div>

            {isAllCoursesLoading ? (
              <div className="text-center py-16 bg-white rounded-3xl">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-2"></div>
                <p className="text-xs text-gray-500">Loading courses...</p>
              </div>
            ) : recommendedCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.map((course) => {
                  const id = course._id || course.id;
                  const title = course.courseTitle || course.title;
                  const image =
                    course.courseThumbnail ||
                    course.image ||
                    'https://placehold.co/600x400/A5B4FC/3730A3?text=Course';
                  const price = course.coursePrice;
                  const lecturesCount = course.lectures?.length || 0;

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden transition duration-300 border border-gray-100 flex flex-col group"
                    >
                      <div className="relative overflow-hidden aspect-video">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Course';
                          }}
                        />
                        {course.category && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-indigo-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                            {course.category}
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {course.courseLevel || 'All Levels'}
                        </span>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {course.description || course.subTitle || 'Comprehensive lessons & notes.'}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-lg font-extrabold text-indigo-600">
                            {price > 0 ? `₹${price}` : 'Free'}
                          </div>
                          <Link
                            to={`/course/${id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            <span>Preview / Enroll</span>
                            <i className="fas fa-arrow-right text-[10px]"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto p-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">
                  <i className="fas fa-check-double"></i>
                </div>
                <h3 className="text-base font-bold text-gray-900">You're All Caught Up!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  You are enrolled in all currently published courses on EduCenter. Stay tuned for upcoming masterclasses!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: PAYMENT & ORDER HISTORY ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Order & Billing History
              </h2>
              <p className="text-xs text-gray-500">
                View receipts and payment details for your enrolled courses.
              </p>
            </div>

            {isPurchasesLoading ? (
              <div className="text-center py-16 bg-white rounded-3xl">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-2"></div>
                <p className="text-xs text-gray-500">Loading purchase records...</p>
              </div>
            ) : purchases.length > 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold uppercase text-[11px] tracking-wider">
                        <th className="py-4 px-6">Course</th>
                        <th className="py-4 px-4">Order ID</th>
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Amount</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {purchases.map((purchase) => {
                        const course = purchase.courseId;
                        const dateStr = new Date(purchase.createdAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        );

                        return (
                          <tr key={purchase._id} className="hover:bg-gray-50/60 transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    course?.courseThumbnail ||
                                    'https://placehold.co/80x50/E0E7FF/4F46E5?text=Course'
                                  }
                                  alt={course?.courseTitle || 'Course'}
                                  className="w-12 h-8 rounded-lg object-cover border border-gray-100 shrink-0"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://placehold.co/80x50/CCCCCC/FFFFFF?text=Course';
                                  }}
                                />
                                <span className="font-bold text-gray-900 truncate max-w-xs">
                                  {course?.courseTitle || 'EduCenter Course'}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-mono text-xs text-gray-500">
                              {purchase.orderId || purchase.paymentId || purchase._id}
                            </td>

                            <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                              {dateStr}
                            </td>

                            <td className="py-4 px-4 font-extrabold text-gray-900 whitespace-nowrap">
                              {purchase.amount > 0 ? `₹${purchase.amount}` : 'Free'}
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  purchase.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                <i className="fas fa-check-circle text-[10px]"></i>
                                {purchase.status === 'completed' ? 'Paid & Active' : purchase.status}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              {course?._id && (
                                <Link
                                  to={`/course/${course._id}`}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>View Course</span>
                                  <i className="fas fa-chevron-right text-[10px]"></i>
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto p-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">
                  <i className="fas fa-receipt"></i>
                </div>
                <h3 className="text-base font-bold text-gray-900">No Orders Yet</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Your purchase receipts and invoices will appear here once you enroll in courses.
                </p>
                <Link
                  to="/courses"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PROFILE & ACCOUNT INFO ================= */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm max-w-3xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-8 text-center sm:text-left">
              <img
                src={user?.photoUrl || 'https://placehold.co/120x120/E0E7FF/4F46E5?text=User'}
                alt={user?.name || 'User'}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-100 shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/120x120/CCCCCC/FFFFFF?text=User';
                }}
              />
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                    Role: {user?.role || 'Student'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                    Enrolled: {enrolledCourses.length} Courses
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">
                  Full Name
                </span>
                <span className="font-bold text-gray-900 mt-1 block">{user?.name}</span>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">
                  Email Address
                </span>
                <span className="font-bold text-gray-900 mt-1 block truncate">
                  {user?.email}
                </span>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">
                  Account Type
                </span>
                <span className="font-bold text-gray-900 mt-1 block">{user?.role || 'Student'}</span>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">
                  Total Video Hours Unlocked
                </span>
                <span className="font-bold text-indigo-600 mt-1 block">
                  {totalLecturesCount} Lessons Available
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/edit-profile"
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-center shadow-lg shadow-indigo-600/20 transition text-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-user-edit"></i>
                <span>Edit Profile & Photo</span>
              </Link>
              <Link
                to="/my-learning"
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl text-center transition text-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-play"></i>
                <span>Open Video Classroom</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
