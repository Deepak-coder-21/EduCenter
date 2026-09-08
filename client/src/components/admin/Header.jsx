import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = ({ title, setIsMobileOpen, onQuickCreate, onRefresh, isRefreshing }) => {
  const { user } = useSelector((state) => state.auth);

  const getTitleInfo = () => {
    switch (title) {
      case 'dashboard':
        return { name: 'Admin Dashboard', desc: 'Welcome back! Here is what’s happening in your academy today.' };
      case 'courses':
        return { name: 'Course Management', desc: 'Create, edit, publish and manage your course catalog.' };
      case 'blog':
        return { name: 'Blog & Content Manager', desc: 'Write, publish, and manage educational articles.' };
      case 'users':
        return { name: 'User Management', desc: 'View registered students and manage instructor privileges.' };
      case 'pages':
        return { name: 'Public Pages Content Manager', desc: 'Customize About Us and Contact Us page content in real-time.' };
      default:
        return { name: title.replace('-', ' '), desc: 'EduCenter Administration' };
    }
  };

  const titleInfo = getTitleInfo();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Breadcrumb & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            aria-label="Open sidebar"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-0.5">
              <span>{user?.role === 'Admin' ? 'Admin' : 'Instructor'}</span>
              <span>/</span>
              <span className="text-indigo-600 capitalize">{title}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {titleInfo.name}
            </h1>
          </div>
        </div>

        {/* Right Side: Quick Action + Profile info */}
        <div className="flex items-center gap-3">
          {/* Global Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium transition ${
                isRefreshing ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
              }`}
              title="Refresh current workspace"
            >
              <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}></i>
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}

          {/* Quick Create Buttons */}
          {title === 'courses' && onQuickCreate && (
            <button
              onClick={onQuickCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition duration-200"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">Add Course</span>
            </button>
          )}

          {title === 'blog' && onQuickCreate && (
            <button
              onClick={onQuickCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition duration-200"
            >
              <i className="fas fa-pen-nib"></i>
              <span className="hidden sm:inline">New Article</span>
            </button>
          )}

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
            <img
              src={user?.photoUrl || 'https://placehold.co/80x80/6366F1/FFFFFF?text=U'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/80x80/6366F1/FFFFFF?text=U';
              }}
            />
            <div className="text-left leading-tight hidden lg:block">
              <div className="text-sm font-bold text-gray-800">
                {user?.name || (user?.role === 'Admin' ? 'Administrator' : 'Instructor')}
              </div>
              <div className={`text-xs font-semibold ${user?.role === 'Admin' ? 'text-amber-600' : 'text-purple-600'}`}>
                {user?.role === 'Admin' ? '👑 Platform Admin' : '📚 Course Instructor'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
