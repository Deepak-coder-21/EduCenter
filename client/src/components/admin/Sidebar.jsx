import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../../features/api/authApi';
import { logout } from '../../features/authSlice';
import { toast } from 'react-toastify';

const allLinks = [
  { id: 'dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard', desc: 'Overview & KPIs', roles: ['Admin'] },
  { id: 'courses', icon: 'fas fa-graduation-cap', label: 'Course Manager', desc: 'Create & manage courses', roles: ['Admin', 'Instructor'] },
  { id: 'blog', icon: 'fas fa-newspaper', label: 'Blog & Content', desc: 'Publish educational articles', roles: ['Admin', 'Instructor'] },
  { id: 'pages', icon: 'fas fa-file-alt', label: 'About & Contact', desc: 'Customize public pages', roles: ['Admin'] },
  { id: 'users', icon: 'fas fa-users-cog', label: 'User Directory', desc: 'Students & Instructors', roles: ['Admin'] },
  { id: 'settings', icon: 'fas fa-sliders-h', label: 'Platform Settings', desc: 'General site settings', roles: ['Admin'] },
];

const Sidebar = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const [logoutUser] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'Admin';
  const isInstructor = user?.role === 'Instructor';

  // Instructors only get Course Manager and Blog & Content. Admins get all.
  const visibleLinks = allLinks.filter((link) => {
    if (isAdmin) return true;
    if (isInstructor) return link.roles.includes('Instructor');
    return false;
  });

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-slate-900 to-indigo-950 text-gray-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/80 bg-gray-950/40">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition duration-200">
              <i className="fas fa-graduation-cap text-lg"></i>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                EduCenter
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium tracking-wide ${
                  isAdmin
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isAdmin ? 'Admin Center' : 'Instructor Portal'}
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Navigation Section Label */}
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400/80 flex items-center justify-between">
          <span>{isAdmin ? 'Platform Management' : 'Instructor Workspace'}</span>
          {isInstructor && (
            <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-md">
              Restricted Access
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {visibleLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setIsMobileOpen(false);
                }}
                className={`group flex items-center w-full px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-indigo-400 group-hover:bg-gray-700/80'
                  }`}
                >
                  <i className={link.icon}></i>
                </div>
                <div className="text-left flex-1">
                  <div className="leading-tight font-semibold">{link.label}</div>
                  <div className={`text-xs opacity-75 ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {link.desc}
                  </div>
                </div>
                {isActive && (
                  <i className="fas fa-chevron-right text-xs opacity-70 ml-2"></i>
                )}
              </button>
            );
          })}
        </nav>

        {/* Public Site Quick Link */}
        <div className="px-4 py-3 border-t border-gray-800/80 bg-gray-950/30">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition duration-200 border border-gray-700/50"
          >
            <i className="fas fa-external-link-alt text-indigo-400"></i>
            <span>View Public Website</span>
          </Link>
        </div>

        {/* User Mini Profile & Logout */}
        <div className="p-4 border-t border-gray-800/80 bg-gray-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={user?.photoUrl || 'https://placehold.co/100x100/6366F1/FFFFFF?text=U'}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/100x100/6366F1/FFFFFF?text=U';
                }}
              />
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-indigo-300 truncate font-medium">
                  {isAdmin ? '👑 Platform Admin' : '📚 Course Instructor'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
