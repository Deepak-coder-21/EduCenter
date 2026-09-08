import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { useLoadUserQuery, authApi } from '../../features/api/authApi';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import CourseManager from './CourseManager';
import BlogManager from './BlogManager';
import UserManager from './UserManager';
import PageManager from './PageManager';
import SettingsManager from './SettingsManager';

const AdminDashboard = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { isLoading: isUserLoading } = useLoadUserQuery();

  const isAdmin = user?.role === 'Admin';
  const isInstructor = user?.role === 'Instructor';

  // Instructors land on 'courses' by default; Admins land on 'dashboard'
  const [activeTab, setActiveTab] = useState(isInstructor ? 'courses' : 'dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Keep activeTab aligned if user role changes or if Instructor enters an unauthorized tab
  useEffect(() => {
    if (isInstructor && !['courses', 'blog'].includes(activeTab)) {
      setActiveTab('courses');
    } else if (isAdmin && !activeTab) {
      setActiveTab('dashboard');
    }
  }, [user?.role, activeTab, isInstructor, isAdmin]);

  // While checking auth on cold refresh (if no user in state yet):
  if (isUserLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium text-sm">Verifying administrative access...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  // If user is a Student or has no staff role, block access
  if (!isAdmin && !isInstructor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            <i className="fas fa-user-lock"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Your account does not have Instructor or Administrator permissions to access the management workspace.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
          >
            <i className="fas fa-home"></i>
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const dispatch = useDispatch();
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);

  // Global Refresh Handler
  const handleGlobalRefresh = async () => {
    setIsGlobalRefreshing(true);
    try {
      dispatch(authApi.util.invalidateTags(['User', 'Course', 'Blog', 'Stats', 'Lecture', 'Settings']));
      toast.success('Admin workspace refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setTimeout(() => setIsGlobalRefreshing(false), 600);
    }
  };

  // Quick Action Handler from Header
  const handleQuickCreate = () => {
    if (activeTab === 'courses') {
      setIsCourseModalOpen(true);
    } else if (activeTab === 'blog') {
      setIsBlogModalOpen(true);
    }
  };

  const renderContent = () => {
    // If Instructor somehow triggers a restricted tab, redirect to CourseManager
    if (isInstructor && !['courses', 'blog'].includes(activeTab)) {
      return (
        <CourseManager
          isModalOpen={isCourseModalOpen}
          setIsModalOpen={setIsCourseModalOpen}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? (
          <DashboardHome setActiveTab={setActiveTab} />
        ) : (
          <CourseManager
            isModalOpen={isCourseModalOpen}
            setIsModalOpen={setIsCourseModalOpen}
          />
        );
      case 'courses':
        return (
          <CourseManager
            isModalOpen={isCourseModalOpen}
            setIsModalOpen={setIsCourseModalOpen}
          />
        );
      case 'blog':
        return (
          <BlogManager
            isModalOpen={isBlogModalOpen}
            setIsModalOpen={setIsBlogModalOpen}
          />
        );
      case 'users':
        return isAdmin ? (
          <UserManager />
        ) : (
          <CourseManager
            isModalOpen={isCourseModalOpen}
            setIsModalOpen={setIsCourseModalOpen}
          />
        );
      case 'pages':
        return isAdmin ? (
          <PageManager />
        ) : (
          <CourseManager
            isModalOpen={isCourseModalOpen}
            setIsModalOpen={setIsCourseModalOpen}
          />
        );
      case 'settings':
        return isAdmin ? (
          <SettingsManager />
        ) : (
          <CourseManager
            isModalOpen={isCourseModalOpen}
            setIsModalOpen={setIsCourseModalOpen}
          />
        );
      default:
        return isInstructor ? (
          <CourseManager
            isModalOpen={isCourseModalOpen}
            setIsModalOpen={setIsCourseModalOpen}
          />
        ) : (
          <DashboardHome setActiveTab={setActiveTab} />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/70 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={activeTab}
          setIsMobileOpen={setIsMobileOpen}
          onQuickCreate={
            activeTab === 'courses' || activeTab === 'blog' ? handleQuickCreate : null
          }
          onRefresh={handleGlobalRefresh}
          isRefreshing={isGlobalRefreshing}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
