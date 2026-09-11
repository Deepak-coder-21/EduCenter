import React, { useState, useRef } from 'react';
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '../../features/api/authApi';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const categories = [
  'All',
  'Exam Preparation',
  'Learning Techniques',
  'Study Guides',
  'Technology & Coding',
  'Campus News',
  'General',
];

// Helper to extract PDF list from blog object
const extractBlogPdfs = (b) => {
  if (!b) return [];
  if (b.pdfFiles && Array.isArray(b.pdfFiles) && b.pdfFiles.length > 0) {
    return b.pdfFiles;
  }
  if (b.pdfUrl) {
    return [{
      url: b.pdfUrl,
      name: b.pdfName || 'notes.pdf',
      publicId: b.pdfPublicId || '',
      size: 0,
    }];
  }
  return [];
};

const BlogManager = ({ isModalOpen, setIsModalOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal & Edit State
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Exam Preparation',
    content: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Multi-PDF State
  const [existingPdfs, setExistingPdfs] = useState([]);
  const [newPdfFiles, setNewPdfFiles] = useState([]);
  const [replaceAllPdfs, setReplaceAllPdfs] = useState(false);

  const contentRef = useRef();
  const fileInputRef = useRef();

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useGetBlogsQuery({
    search: search || undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Blog articles refreshed!');
    } catch (err) {
      toast.error('Failed to refresh blogs');
    }
  };

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const blogs = data?.blogs || [];

  const handleOpenCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      author: user?.name || 'Admin',
      category: 'Exam Preparation',
      content: '',
    });
    setThumbnailFile(null);
    setThumbnailPreview('');
    setExistingPdfs([]);
    setNewPdfFiles([]);
    setReplaceAllPdfs(false);
    setIsModalOpen(true);
    setTimeout(() => {
      if (contentRef.current) contentRef.current.innerHTML = '';
    }, 50);
  };

  const handleOpenEditModal = (b) => {
    setEditingBlog(b);
    setFormData({
      title: b.title || '',
      author: b.author || user?.name || 'Admin',
      category: b.category || 'Exam Preparation',
      content: b.content || '',
    });
    setThumbnailFile(null);
    setThumbnailPreview(b.thumbnail || '');
    setExistingPdfs(extractBlogPdfs(b));
    setNewPdfFiles([]);
    setReplaceAllPdfs(false);
    setIsModalOpen(true);
    setTimeout(() => {
      if (contentRef.current) contentRef.current.innerHTML = sanitizeHtml(b.content || '');
    }, 50);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setThumbnailPreview('');
    setThumbnailFile(null);
    setExistingPdfs([]);
    setNewPdfFiles([]);
    setReplaceAllPdfs(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validPdfs = [];
    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast.error(`"${file.name}" is not a PDF file.`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 20MB limit.`);
        continue;
      }
      validPdfs.push(file);
    }

    if (validPdfs.length > 0) {
      setNewPdfFiles((prev) => [...prev, ...validPdfs]);
      toast.info(`Added ${validPdfs.length} PDF(s) to upload queue.`);
    }

    // Reset input value so the same file could be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveNewPdf = (index) => {
    setNewPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPdf = (index) => {
    setExistingPdfs((prev) => prev.filter((_, i) => i !== index));
    toast.info('PDF removed. Save changes to delete it from storage.');
  };

  const handleClearAllExistingPdfs = () => {
    setExistingPdfs([]);
    toast.info('All previous PDFs removed. Save changes to delete them from storage.');
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawContent = contentRef.current?.innerHTML || formData.content;
    const contentHtml = sanitizeHtml(rawContent);

    if (!formData.title || !contentHtml.trim()) {
      toast.error('Please provide a title and article content.');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('author', formData.author || user?.name || 'Admin');
    payload.append('category', formData.category);
    payload.append('content', contentHtml);

    if (thumbnailFile) {
      payload.append('thumbnail', thumbnailFile);
    }

    // Append all selected new PDF files
    newPdfFiles.forEach((file) => {
      payload.append('notesPdf', file);
    });

    try {
      if (editingBlog) {
        payload.append('replaceAllPdfs', String(replaceAllPdfs));
        payload.append('retainedPdfs', JSON.stringify(replaceAllPdfs ? [] : existingPdfs));
        await updateBlog({ id: editingBlog._id, formData: payload }).unwrap();
        toast.success('Article updated successfully!');
      } else {
        await createBlog(payload).unwrap();
        toast.success('Article published successfully!');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save blog post');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('Article deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete article');
      }
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
              placeholder="Search articles by title or keyword..."
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
        </div>

        {/* Create Article Button */}
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition duration-200 shrink-0"
        >
          <i className="fas fa-pen-nib"></i>
          <span>New Article</span>
        </button>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Published Blog Articles</h2>
            <p className="text-xs text-gray-600">Showing {blogs.length} articles</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className={`px-3 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-medium ${
              isFetching ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
            }`}
            title="Refresh articles list"
          >
            <i className={`fas fa-sync-alt ${isFetching ? 'animate-spin text-indigo-600' : ''}`}></i>
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 text-2xl mx-auto mb-4">
              <i className="fas fa-newspaper"></i>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No articles published yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              Share study guides, exam strategies, and educational resources with your students.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
            >
              <i className="fas fa-pen-nib mr-2"></i> Write First Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Notes PDFs</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {blogs.map((b) => {
                  const blogPdfs = extractBlogPdfs(b);
                  return (
                    <tr key={b._id} className="hover:bg-gray-50/70 transition">
                      {/* Title & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              b.thumbnail ||
                              'https://placehold.co/100x70/E0E7FF/4F46E5?text=Blog'
                            }
                            alt={b.title}
                            className="w-14 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x70/E0E7FF/4F46E5?text=Blog';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-sm">
                              {b.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {b.category || 'Education'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 text-gray-700 font-medium whitespace-nowrap">
                        {b.author || 'Admin'}
                      </td>

                      {/* Notes PDFs */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {blogPdfs.length === 0 ? (
                          <span className="text-gray-400 text-xs">—</span>
                        ) : blogPdfs.length === 1 ? (
                          <a
                            href={blogPdfs[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition"
                            title={blogPdfs[0].name || 'Download PDF'}
                          >
                            <i className="fas fa-file-pdf"></i>
                            <span className="max-w-[90px] truncate">{blogPdfs[0].name || 'PDF'}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 border border-red-200 text-xs font-bold shadow-sm">
                              <i className="fas fa-copy"></i>
                              <span>{blogPdfs.length} PDFs</span>
                            </span>
                            <a
                              href={blogPdfs[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5 hover:underline"
                              title={`Open ${blogPdfs[0].name}`}
                            >
                              <span>View</span>
                              <i className="fas fa-external-link-alt text-[10px]"></i>
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(b.createdAt || b.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(b)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Article"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(b._id, b.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Article"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blog Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <i className={editingBlog ? 'fas fa-edit' : 'fas fa-pen-nib'}></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingBlog ? 'Edit Blog Article' : 'Publish New Article'}
                  </h3>
                  <p className="text-xs text-purple-100">
                    Write rich articles, study resources, and academic tips for students
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
              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Proven Strategies for Board Exam Success"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    placeholder="Author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Category
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

              {/* Rich Content Editor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Article Content <span className="text-red-500">*</span>
                </label>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-100 rounded-t-xl border border-gray-200 border-b-0">
                  <button
                    type="button"
                    onClick={() => execCmd('bold')}
                    className="p-2 hover:bg-white rounded-lg text-gray-700 transition"
                    title="Bold"
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('italic')}
                    className="p-2 hover:bg-white rounded-lg text-gray-700 transition"
                    title="Italic"
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('underline')}
                    className="p-2 hover:bg-white rounded-lg text-gray-700 transition"
                    title="Underline"
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => execCmd('formatBlock', '<h2>')}
                    className="px-2.5 py-1 hover:bg-white rounded-lg text-xs font-bold text-gray-700 transition"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('formatBlock', '<h3>')}
                    className="px-2.5 py-1 hover:bg-white rounded-lg text-xs font-bold text-gray-700 transition"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('formatBlock', '<p>')}
                    className="px-2.5 py-1 hover:bg-white rounded-lg text-xs font-medium text-gray-700 transition"
                  >
                    Paragraph
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => execCmd('insertUnorderedList')}
                    className="p-2 hover:bg-white rounded-lg text-gray-700 transition"
                    title="Bullet List"
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('insertOrderedList')}
                    className="p-2 hover:bg-white rounded-lg text-gray-700 transition"
                    title="Numbered List"
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('formatBlock', '<blockquote>')}
                    className="p-2 hover:bg-white rounded-lg text-gray-700 transition"
                    title="Quote"
                  >
                    <i className="fas fa-quote-right"></i>
                  </button>
                </div>

                {/* Editable Area */}
                <div
                  ref={contentRef}
                  contentEditable
                  className="w-full min-h-[220px] p-4 bg-gray-50 border border-gray-200 rounded-b-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm leading-relaxed"
                ></div>
              </div>

              {/* Thumbnail Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Featured Thumbnail Image
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
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Multi-PDF Upload Section */}
              <div className="rounded-2xl border border-dashed border-red-300 bg-red-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    <i className="fas fa-file-pdf text-red-500 mr-1.5"></i>
                    Upload Notes PDFs (List of PDFs)
                    <span className="ml-2 text-gray-400 normal-case font-normal">(optional · max 20MB each)</span>
                  </label>
                </div>

                {/* Existing PDFs when editing */}
                {editingBlog && existingPdfs.length > 0 && !replaceAllPdfs && (
                  <div className="space-y-2 bg-white/80 p-3 rounded-xl border border-red-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 pb-1 border-b border-gray-100">
                      <span>Currently Attached PDFs ({existingPdfs.length})</span>
                      <button
                        type="button"
                        onClick={handleClearAllExistingPdfs}
                        className="text-red-500 hover:text-red-700 text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <i className="fas fa-trash-alt"></i> Remove All
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {existingPdfs.map((pdf, idx) => (
                        <div
                          key={pdf._id || pdf.url || idx}
                          className="flex items-center justify-between px-3 py-1.5 bg-red-50/60 hover:bg-red-50 rounded-lg text-xs border border-red-100 transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <i className="fas fa-file-pdf text-red-500 shrink-0"></i>
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-800 hover:text-red-600 truncate max-w-xs hover:underline"
                              title="Click to view PDF"
                            >
                              {pdf.name || `document_${idx + 1}.pdf`}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingPdf(idx)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Delete this PDF (will remove from storage upon saving)"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Option to replace all previous PDFs if editing and existing PDFs exist */}
                {editingBlog && (extractBlogPdfs(editingBlog).length > 0) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <input
                      type="checkbox"
                      id="replaceAllPdfsCheckbox"
                      checked={replaceAllPdfs}
                      onChange={(e) => setReplaceAllPdfs(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="replaceAllPdfsCheckbox" className="font-semibold cursor-pointer select-none">
                      Delete all previous PDFs and replace completely with new uploads
                    </label>
                  </div>
                )}

                {/* Staged New PDFs to be uploaded */}
                {newPdfFiles.length > 0 && (
                  <div className="space-y-2 bg-white/80 p-3 rounded-xl border border-green-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-green-800 pb-1 border-b border-gray-100">
                      <span>Newly Added PDFs ({newPdfFiles.length}) to Upload</span>
                      <button
                        type="button"
                        onClick={() => setNewPdfFiles([])}
                        className="text-red-500 hover:text-red-700 text-[11px] font-semibold transition"
                      >
                        Clear New
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {newPdfFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-1.5 bg-green-50/60 rounded-lg text-xs border border-green-100"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <i className="fas fa-check-circle text-green-600 shrink-0"></i>
                            <span className="font-medium text-gray-800 truncate max-w-xs">{file.name}</span>
                            <span className="text-gray-400 text-[11px] shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewPdf(idx)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Remove from upload queue"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple PDF File Input */}
                <div>
                  <input
                    ref={fileInputRef}
                    id="notesPdfInput"
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 cursor-pointer"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    You can select multiple PDF files at once. When saving, previous removed PDFs will be deleted from Cloudinary.
                  </p>
                </div>
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
                  <span>{editingBlog ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
