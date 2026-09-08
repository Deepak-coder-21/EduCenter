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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);

  const currentUser = user || userData?.user;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold text-indigo-600 flex items-center">
          <i className="fas fa-graduation-cap mr-2"></i>
          {platformName}
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 items-center">
          <NavLink to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition duration-300">Home</NavLink>
          <NavLink to="/courses" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition duration-300">Courses</NavLink>
          <NavLink to="/about" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition duration-300">About Us</NavLink>
          <NavLink to="/blog" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition duration-300">Resources</NavLink>
          <NavLink to="/contact" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition duration-300">Contact</NavLink>

          {/* Profile Dropdown or Login Button */}
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="focus:outline-none rounded-full transition duration-300 transform hover:scale-110">
                <img
                  className="h-10 w-10 rounded-full object-cover border-2 border-indigo-500"
                  src={currentUser?.photoUrl || "https://placehold.co/40x40/E9E9FF/6366F1?text=U"}
                  alt="User profile"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=E'; }}
                />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-20 py-1 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm text-gray-800 font-semibold">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white transition duration-300">Dashboard</Link>
                  <Link to="/my-learning" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white transition duration-300">My Learning</Link>
                  <Link to="/edit-profile" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white transition duration-300">Edit Profile</Link>
                  {currentUser?.role === 'Admin' && (
                    <Link to="/admindashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-amber-700 font-bold bg-amber-50 hover:bg-amber-600 hover:text-white transition duration-300">
                      <i className="fas fa-crown mr-2 text-amber-500"></i> Admin Center
                    </Link>
                  )}
                  {currentUser?.role === 'Instructor' && (
                    <Link to="/admindashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-purple-700 font-bold bg-purple-50 hover:bg-purple-600 hover:text-white transition duration-300">
                      <i className="fas fa-chalkboard-teacher mr-2 text-purple-500"></i> Instructor Panel
                    </Link>
                  )}
                  <div className="border-t my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-300 hover:text-white transition duration-300">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 cta-button">Login/Sign Up</NavLink>
          )}

        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {/* Animated Hamburger Icon */}
            <div className="w-6 h-6 flex flex-col justify-around">
              <span className={`block w-full h-0.5 bg-gray-600 transition-transform duration-300 ${menuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-gray-600 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-gray-600 transition-transform duration-300 ${menuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-6 pb-4 space-y-2 shadow-lg">
          <NavLink to="/" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/courses" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>Courses</NavLink>
          <NavLink to="/about" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/blog" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>Resources</NavLink>
          <NavLink to="/contact" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>Contact</NavLink>

          <div className="border-t pt-4 mt-4">
            {isAuthenticated ? (
              <div>
                <div className="flex items-center mb-3 px-3">
                  <img
                    className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-indigo-500"
                    src={currentUser?.photoUrl || "https://placehold.co/40x40/E9E9FF/6366F1?text=U"}
                    alt="User profile"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=E'; }}
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/my-learning" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>My Learning</Link>
                <Link to="/edit-profile" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" onClick={() => setMenuOpen(false)}>Edit Profile</Link>
                {currentUser?.role === 'Admin' && (
                  <Link to="/admindashboard" className="block text-amber-700 font-bold hover:text-amber-900 px-3 py-2 rounded-md bg-amber-50" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-crown mr-2 text-amber-500"></i> Admin Center
                  </Link>
                )}
                {currentUser?.role === 'Instructor' && (
                  <Link to="/admindashboard" className="block text-purple-700 font-bold hover:text-purple-900 px-3 py-2 rounded-md bg-purple-50" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-chalkboard-teacher mr-2 text-purple-500"></i> Instructor Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-300 hover:text-white transition duration-300">Logout</button>
              </div>
            ) : (
              <NavLink to="/login" className="block text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 cta-button"onClick={() => setMenuOpen(false)}>Login/Sign Up</NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

