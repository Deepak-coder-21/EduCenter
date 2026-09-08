import React from 'react';
import { useGetAdminStatsQuery } from '../../features/api/authApi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const DashboardHome = ({ setActiveTab }) => {
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminStatsQuery();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Dashboard metrics refreshed!');
    } catch (err) {
      toast.error('Failed to refresh dashboard');
    }
  };

  const stats = data?.stats || {
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalBlogs: 0,
    totalInstructors: 0,
    totalUsers: 0,
  };

  const recentCourses = data?.recentCourses || [];
  const recentUsers = data?.recentUsers || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading academy analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      sub: 'Enrolled learners',
      icon: 'fas fa-user-graduate',
      color: 'from-blue-500 to-indigo-600',
      tab: 'users',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      sub: `${stats.publishedCourses || 0} published online`,
      icon: 'fas fa-book-open',
      color: 'from-indigo-600 to-purple-600',
      tab: 'courses',
    },
    {
      title: 'Educational Articles',
      value: stats.totalBlogs,
      sub: 'Published blogs & tips',
      icon: 'fas fa-newspaper',
      color: 'from-violet-600 to-fuchsia-600',
      tab: 'blog',
    },
    {
      title: 'Instructors & Staff',
      value: stats.totalInstructors,
      sub: 'Active teaching team',
      icon: 'fas fa-chalkboard-teacher',
      color: 'from-emerald-500 to-teal-600',
      tab: 'users',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            ✨ Academy Overview
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome to EduCenter Command Center
          </h2>
          <p className="text-indigo-100 text-sm md:text-base leading-relaxed mb-6">
            Track student growth, manage course curriculum, publish student resources, and configure instructor privileges seamlessly in real time.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('courses')}
              className="px-4 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm shadow-md hover:bg-indigo-50 transition"
            >
              <i className="fas fa-plus mr-2"></i> Add New Course
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className="px-4 py-2.5 bg-indigo-900/50 hover:bg-indigo-900/70 text-white font-semibold rounded-xl text-sm border border-white/20 transition backdrop-blur-sm"
            >
              <i className="fas fa-pen mr-2"></i> Write Article
            </button>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              title="Refresh Data"
              className={`px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition flex items-center gap-2 ${
                isFetching ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <i className={`fas fa-sync-alt ${isFetching ? 'animate-spin' : ''}`}></i>
              <span className="text-xs font-medium hidden sm:inline">
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(kpi.tab)}
            className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {kpi.title}
              </span>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition duration-300`}
              >
                <i className={`${kpi.icon} text-lg`}></i>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {kpi.value}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <i className="fas fa-info-circle text-indigo-500"></i>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Courses</h3>
              <p className="text-xs text-gray-600">Latest additions to your catalog</p>
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {recentCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <i className="fas fa-book-open text-3xl mb-2 text-gray-300"></i>
              <p className="text-sm">No courses created yet.</p>
              <button
                onClick={() => setActiveTab('courses')}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Create your first course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase">
                    <th className="pb-3">Course</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentCourses.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={c.courseThumbnail || 'https://placehold.co/80x50/E0E7FF/4F46E5?text=Course'}
                          alt={c.courseTitle}
                          className="w-10 h-8 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/80x50/E0E7FF/4F46E5?text=Course';
                          }}
                        />
                        <div className="font-semibold text-gray-800 truncate max-w-[140px]">
                          {c.courseTitle}
                        </div>
                      </td>
                      <td className="py-3 text-xs text-gray-600">{c.category}</td>
                      <td className="py-3 font-semibold text-gray-900">
                        {c.coursePrice ? `₹${c.coursePrice}` : 'Free'}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Registered Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
              <p className="text-xs text-gray-600">New students and educators</p>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage Users</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <i className="fas fa-users text-3xl mb-2 text-gray-300"></i>
              <p className="text-sm">No registered users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={u.photoUrl || 'https://placehold.co/40x40/6366F1/FFFFFF?text=U'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/40x40/6366F1/FFFFFF?text=U';
                          }}
                        />
                        <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                          {u.name}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-600 truncate max-w-[140px]">{u.email}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'Instructor'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {u.role || 'Student'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
