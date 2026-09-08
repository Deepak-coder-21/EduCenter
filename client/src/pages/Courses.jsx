import React, { useState } from 'react';
import CourseCard from '../components/CourseCard';
import { useGetCoursesQuery } from '../features/api/authApi';
import fallbackCourses from '../data/courses.json';

const categories = [
  'All',
  'Mathematics',
  'Physics & Science',
  'Computer Science & Coding',
  'Engineering',
  'Exam Preparation',
  'General',
];

function Courses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data, isLoading } = useGetCoursesQuery({
    search: search || undefined,
    category: category !== 'All' ? category : undefined,
    isPublished: true,
  });

  const backendCourses = data?.courses || [];
  const displayCourses = backendCourses.length > 0 ? backendCourses : (category === 'All' && !search ? fallbackCourses : []);

  return (
    <main className="py-16 bg-gray-50/50 min-h-[85vh]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Explore Academy Curriculum
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Our Online Courses
          </h1>
          <p className="text-base text-gray-600 mt-3">
            Explore our comprehensive range of courses designed to help you excel academically and master competitive exams.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by course title, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading courses...</p>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl mx-auto mb-4">
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No courses found</h3>
            <p className="text-sm text-gray-600">
              Try adjusting your search query or selecting a different category filter.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Courses;
