import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLogoutMutation, useLoadUserQuery, useGetSettingsQuery } from '../features/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { data: userData, isFetching, isError } = useLoadUserQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const platformName = settingsData?.settings?.platformName || 'EduCenter';

  const [logoutUser] = useLogoutMutation();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [profileMenuRef]);

  const currentUser = user || userData?.user;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-[68px] flex justify-between items-center max-w-7xl">
        <NavLink to="/" className="text-xl sm:text-2xl font-extrabold text-indigo-600 flex items-center shrink-0 tracking-tight">
          <i className="fas fa-graduation-cap mr-2 sm:mr-2.5 text-indigo-600 text-xl sm:text-2xl"></i>
          <span>{platformName}</span>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
          <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition duration-200 ${isActive ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>Home</NavLink>
          <NavLink to="/courses" className={({ isActive }) => `px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition duration-200 ${isActive ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>Courses</NavLink>
          <NavLink to="/about" className={({ isActive }) => `px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition duration-200 ${isActive ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>About Us</NavLink>
          <NavLink to="/blog" className={({ isActive }) => `px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition duration-200 ${isActive ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>Resources</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition duration-200 ${isActive ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>Contact</NavLink>

          {/* Profile Dropdown or Login Button */}
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="focus:outline-none rounded-full transition duration-200 transform hover:scale-105 shrink-0 flex items-center justify-center ring-2 ring-indigo-500 ring-offset-2 ring-offset-white cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden aspect-square shrink-0 flex items-center justify-center bg-indigo-50 shadow-xs">
                  <img
                    className="w-full h-full object-cover rounded-full aspect-square"
                    src={currentUser?.photoUrl || "https://placehold.co/40x40/E9E9FF/6366F1?text=U"}
                    alt="User profile"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=E'; }}
                  />
                </div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl z-20 py-1.5 ring-1 ring-black/5 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden aspect-square shrink-0 ring-2 ring-indigo-500 ring-offset-1 bg-indigo-50 flex items-center justify-center">
                      <img
                        className="w-full h-full object-cover rounded-full aspect-square"
                        src={currentUser?.photoUrl || "https://placehold.co/40x40/E9E9FF/6366F1?text=U"}
                        alt="User profile"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=E'; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 font-semibold truncate">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-200">Dashboard</Link>
                  <Link to="/my-learning" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-200">My Learning</Link>
                  <Link to="/edit-profile" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-200">Edit Profile</Link>
                  {currentUser?.role === 'Admin' && (
                    <Link to="/admindashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-amber-700 font-bold bg-amber-50/80 hover:bg-amber-100 transition duration-200">
                      <i className="fas fa-crown mr-2 text-amber-500"></i> Admin Center
                    </Link>
                  )}
                  {currentUser?.role === 'Instructor' && (
                    <Link to="/admindashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-purple-700 font-bold bg-purple-50/80 hover:bg-purple-100 transition duration-200">
                      <i className="fas fa-chalkboard-teacher mr-2 text-purple-500"></i> Instructor Panel
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200 cursor-pointer">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs lg:text-sm font-semibold px-4 py-2 sm:py-2.5 rounded-xl shadow-sm transition duration-200 shrink-0 ml-1">Login / Sign Up</NavLink>
          )}

        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-indigo-50 active:bg-indigo-100 text-gray-700 hover:text-indigo-600 border border-gray-200/80 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95 shadow-xs cursor-pointer"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            <i className={`fas ${menuOpen ? 'fa-times text-lg text-indigo-600' : 'fa-bars text-base text-gray-700'} transition-transform duration-200 ${menuOpen ? 'rotate-90' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {menuOpen && (
        <div className="md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 sm:top-[68px] bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative z-50 bg-white border-b border-gray-200 shadow-2xl px-4 pt-3 pb-6 max-h-[calc(100vh-70px)] overflow-y-auto">
            {/* User Profile Card (if authenticated) */}
            {isAuthenticated && (
              <div className="mb-3.5 p-3 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/90 rounded-2xl border border-indigo-100/90 flex items-center gap-3 shadow-xs">
                <div className="w-11 h-11 rounded-full overflow-hidden aspect-square shrink-0 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white flex items-center justify-center bg-white shadow-xs">
                  <img
                    className="w-full h-full object-cover rounded-full aspect-square"
                    src={currentUser?.photoUrl || "https://placehold.co/40x40/E9E9FF/6366F1?text=U"}
                    alt="User profile"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=E'; }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm truncate">{currentUser?.name}</p>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-600 text-white shadow-xs">
                      {currentUser?.role || 'Student'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser?.email}</p>
                </div>
              </div>
            )}

            {/* Main Navigation Options with rich icons & badges */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1 block">
                Menu Options
              </span>
              {[
                { to: '/', label: 'Home', icon: 'fa-home', color: 'text-indigo-600 bg-indigo-50' },
                { to: '/courses', label: 'Courses', icon: 'fa-graduation-cap', color: 'text-violet-600 bg-violet-50' },
                { to: '/about', label: 'About Us', icon: 'fa-heart', color: 'text-pink-600 bg-pink-50' },
                { to: '/blog', label: 'Study Resources', icon: 'fa-book-open', color: 'text-emerald-600 bg-emerald-50' },
                { to: '/contact', label: 'Contact Support', icon: 'fa-headset', color: 'text-amber-600 bg-amber-50' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition duration-200 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.color
                          }`}
                        >
                          <i className={`fas ${item.icon}`}></i>
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <i
                        className={`fas fa-chevron-right text-xs transition duration-200 ${
                          isActive ? 'text-white/75' : 'text-gray-400 group-hover:text-indigo-600'
                        }`}
                      ></i>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Authenticated Account Options */}
            {isAuthenticated ? (
              <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1 block">
                  Student Account
                </span>

                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                      <i className="fas fa-chart-pie"></i>
                    </div>
                    <span>Student Dashboard</span>
                  </div>
                  <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:text-blue-600"></i>
                </Link>

                <Link
                  to="/my-learning"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                      <i className="fas fa-play-circle"></i>
                    </div>
                    <span>My Enrolled Courses</span>
                  </div>
                  <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:text-emerald-600"></i>
                </Link>

                <Link
                  to="/edit-profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                      <i className="fas fa-user-cog"></i>
                    </div>
                    <span>Edit Profile Settings</span>
                  </div>
                  <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:text-purple-600"></i>
                </Link>

                {currentUser?.role === 'Admin' && (
                  <Link
                    to="/admindashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-bold text-amber-800 bg-amber-50/80 hover:bg-amber-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs">
                        <i className="fas fa-crown"></i>
                      </div>
                      <span>Admin Management Center</span>
                    </div>
                    <i className="fas fa-chevron-right text-xs text-amber-600"></i>
                  </Link>
                )}

                {currentUser?.role === 'Instructor' && (
                  <Link
                    to="/admindashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-bold text-purple-800 bg-purple-50/80 hover:bg-purple-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow-xs">
                        <i className="fas fa-chalkboard-teacher"></i>
                      </div>
                      <span>Instructor Portal</span>
                    </div>
                    <i className="fas fa-chevron-right text-xs text-purple-600"></i>
                  </Link>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 border border-red-100 transition duration-200 cursor-pointer"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition shadow-xs"
                >
                  <i className="fas fa-sign-in-alt text-xs text-gray-500"></i>
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <i className="fas fa-user-plus text-xs"></i>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

