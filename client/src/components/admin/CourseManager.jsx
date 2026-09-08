import React, { useState } from 'react';
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useTogglePublishCourseMutation,
} from '../../features/api/authApi';
import { toast } from 'react-toastify';
import LectureModal from './LectureModal';

const categories = [
  'All',
  'Mathematics',
  'Physics & Science',
  'Computer Science & Coding',
  'Engineering',
  'Exam Preparation',
  'General',
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const CourseManager = ({ isModalOpen, setIsModalOpen }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Modal & Form state
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseForLectures, setSelectedCourseForLectures] = useState(null);
  const [formData, setFormData] = useState({
    courseTitle: '',
    subTitle: '',
    category: 'Mathematics',
    courseLevel: 'Beginner',
    coursePrice: '',
    description: '',
    isPublished: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useGetCoursesQuery({
    search: search || undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    level: selectedLevel !== 'All' ? selectedLevel : undefined,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Course catalog refreshed!');
    } catch (err) {
      toast.error('Failed to refresh courses');
    }
  };

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [togglePublishCourse] = useTogglePublishCourseMutation();

  const courses = data?.courses || [];

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      courseTitle: '',
      subTitle: '',
      category: 'Mathematics',
      courseLevel: 'Beginner',
      coursePrice: '',
      description: '',
      isPublished: true,
    });
    setThumbnailFile(null);
    setThumbnailPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingCourse(c);
    setFormData({
      courseTitle: c.courseTitle || '',
      subTitle: c.subTitle || '',
      category: c.category || 'Mathematics',
      courseLevel: c.courseLevel || 'Beginner',
      coursePrice: c.coursePrice !== undefined ? c.coursePrice : '',
      description: c.description || '',
      isPublished: c.isPublished !== undefined ? c.isPublished : true,
    });
    setThumbnailFile(null);
    setThumbnailPreview(c.courseThumbnail || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setThumbnailPreview('');
    setThumbnailFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseTitle || !formData.category) {
      toast.error('Please enter course title and category.');
      return;
    }

    const payload = new FormData();
    payload.append('courseTitle', formData.courseTitle);
    payload.append('subTitle', formData.subTitle);
    payload.append('category', formData.category);
    payload.append('courseLevel', formData.courseLevel);
    payload.append('coursePrice', formData.coursePrice || 0);
    payload.append('description', formData.description);
    payload.append('isPublished', formData.isPublished);

    if (thumbnailFile) {
      payload.append('thumbnail', thumbnailFile);
    }

    try {
      if (editingCourse) {
        await updateCourse({ id: editingCourse._id, formData: payload }).unwrap();
        toast.success('Course updated successfully!');
      } else {
        await createCourse(payload).unwrap();
        toast.success('Course created successfully!');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save course');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteCourse(id).unwrap();
        toast.success('Course deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await togglePublishCourse(id).unwrap();
      toast.success(res.message || 'Publish status updated');
    } catch (err) {
      toast.error('Failed to toggle publish status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search courses by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">Level: All</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                Level: {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Create Course Button */}
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition duration-200 shrink-0"
        >
          <i className="fas fa-plus"></i>
          <span>Create Course</span>
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">All Academy Courses</h2>
            <p className="text-xs text-gray-600">Showing {courses.length} courses</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className={`px-3 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-medium ${
              isFetching ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
            }`}
            title="Refresh course list"
          >
            <i className={`fas fa-sync-alt ${isFetching ? 'animate-spin text-indigo-600' : ''}`}></i>
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl mx-auto mb-4">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No courses found</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              Get started by creating your first online course with lessons, resources, and pricing.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
            >
              <i className="fas fa-plus mr-2"></i> Create Course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50/70 transition">
                    {/* Course Title & Thumbnail */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            course.courseThumbnail ||
                            'https://placehold.co/100x70/E0E7FF/4F46E5?text=Course'
                          }
                          alt={course.courseTitle}
                          className="w-14 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x70/E0E7FF/4F46E5?text=Course';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-xs">
                            {course.courseTitle}
                          </p>
                          {course.subTitle && (
                            <p className="text-xs text-gray-600 truncate max-w-xs">
                              {course.subTitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-gray-600 font-medium whitespace-nowrap">
                      {course.category}
                    </td>

                    {/* Level */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          course.courseLevel === 'Advanced'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : course.courseLevel === 'Intermediate'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {course.courseLevel || 'Beginner'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {course.coursePrice > 0 ? `₹${course.coursePrice}` : 'Free'}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          course.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            course.isPublished ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCourseForLectures(course)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200/60"
                          title="Manage Curriculum & Videos"
                        >
                          <i className="fas fa-video text-indigo-600"></i>
                          <span>Curriculum ({course.lectures?.length || 0})</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Course"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(course._id, course.courseTitle)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Course"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <i className={editingCourse ? 'fas fa-edit' : 'fas fa-plus'}></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingCourse ? 'Edit Course Details' : 'Create New Course'}
                  </h3>
                  <p className="text-xs text-indigo-100">
                    {editingCourse
                      ? 'Update curriculum information and thumbnail'
                      : 'Fill in details to add a course to the catalog'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics for Beginners: Master the Basics"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Subtitle / Short Catchphrase
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. From Algebra fundamentals to Problem Solving"
                    value={formData.subTitle}
                    onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category, Level, Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Skill Level
                  </label>
                  <select
                    value={formData.courseLevel}
                    onChange={(e) => setFormData({ ...formData, courseLevel: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free"
                    value={formData.coursePrice}
                    onChange={(e) => setFormData({ ...formData, coursePrice: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Course Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Detailed overview of what students will learn, syllabus modules, and prerequisites..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Course Thumbnail (Image)
                </label>
                <div className="flex items-center gap-4">
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-20 h-14 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Published Switch */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <div className="text-sm font-bold text-gray-800">Publish Immediately</div>
                  <div className="text-xs text-gray-500">
                    Make course visible to all students on the public website.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingCourse ? 'Save Changes' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum & Lecture Management Modal */}
      <LectureModal
        course={selectedCourseForLectures}
        isOpen={!!selectedCourseForLectures}
        onClose={() => {
          setSelectedCourseForLectures(null);
          refetch();
        }}
      />
    </div>
  );
};

export default CourseManager;
