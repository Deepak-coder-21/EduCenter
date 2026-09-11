
/* File: App.jsx */
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import Home from './src/pages/Home';
import Courses from './src/pages/Courses';
import CourseDetails from './src/pages/CourseDetails';
import Dashboard from './src/pages/DashBoard';
import ContactUs from './src/pages/ContactUs';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import AboutUs from './src/pages/AboutUs';
import Privacy from './src/pages/Privacy';
import Terms from './src/pages/Terms';
import Blog from './src/pages/Blog';
import MyLearning from './src/pages/MyLearnig';
import EditProfile from './src/pages/EditProfile';
import AdminDashboard from './src/components/admin/AdminDashboard';
import ScrollToTop from './src/components/ScrollToTop';
import { useLoadUserQuery } from './src/features/api/authApi';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Protect login and signup: redirect already logged-in users to their respective workspace
function GuestRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    const dest = user.role === 'Admin' || user.role === 'Instructor' ? '/admin' : '/';
    return <Navigate to={dest} replace />;
  }

  return children;
}

function AppContent() {
  useLoadUserQuery();
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/admindashboard');

  return (
    <div className="flex flex-col min-h-screen w-full">
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;


