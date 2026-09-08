import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useLoginMutation,
  useSendResetOtpMutation,
  useResetPasswordWithOtpMutation,
} from '../features/api/authApi';
import { toast } from 'react-toastify';
import OtpInput from '../components/OtpInput';

function Login() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from Signup or Reset Password, pre-fill email
  const prefilledEmail = location.state?.email || '';

  const [loginInput, setLoginInput] = useState({
    email: prefilledEmail,
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  // ================= FORGOT PASSWORD MODAL STATE =================
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [resetEmail, setResetEmail] = useState('');
  const [sentToEmail, setSentToEmail] = useState('');
  const [isAdminReset, setIsAdminReset] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Countdown timer for reset OTP
  const [resetCountdown, setResetCountdown] = useState(60);
  const [isResetCountingDown, setIsResetCountingDown] = useState(false);

  const [sendResetOtp, { isLoading: isSendingResetOtp }] = useSendResetOtpMutation();
  const [resetPasswordWithOtp, { isLoading: isResettingPassword }] = useResetPasswordWithOtpMutation();

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (isResetCountingDown && resetCountdown > 0) {
      timer = setInterval(() => {
        setResetCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resetCountdown === 0) {
      setIsResetCountingDown(false);
    }
    return () => clearInterval(timer);
  }, [isResetCountingDown, resetCountdown]);

  // If already authenticated, redirect immediately away from login
  if (isAuthenticated && user) {
    const dest = user.role === 'Admin' || user.role === 'Instructor' ? '/admin' : '/';
    return <Navigate to={dest} replace />;
  }

  const changeInputHandler = (e) => {
    setLoginInput({
      ...loginInput,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(loginInput).unwrap();
      toast.success('Login successful!');
      const loggedInRole = res?.user?.role || user?.role;
      if (loggedInRole === 'Admin' || loggedInRole === 'Instructor') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // Open Forgot Password modal
  const handleOpenForgotModal = () => {
    setResetEmail(loginInput.email || '');
    setSentToEmail('');
    setIsAdminReset(false);
    setForgotStep(1);
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsForgotModalOpen(true);
  };

  // Send Reset OTP
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      const res = await sendResetOtp({ email: resetEmail.trim() }).unwrap();
      toast.success(res?.message || 'Password reset code sent to your email!');
      setSentToEmail(res?.sentTo || resetEmail.trim());
      setIsAdminReset(Boolean(res?.isAdmin));
      setForgotStep(2);
      setResetCountdown(60);
      setIsResetCountingDown(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send reset code. Please verify your email.');
    }
  };

  // Resend Reset OTP
  const handleResendResetCode = async () => {
    if (isResetCountingDown || isSendingResetOtp) return;
    try {
      const res = await sendResetOtp({ email: resetEmail.trim() }).unwrap();
      toast.success(res?.message || 'New reset code sent!');
      setResetOtp('');
      setResetCountdown(60);
      setIsResetCountingDown(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend code.');
    }
  };

  // Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetOtp || resetOtp.length < 6) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const res = await resetPasswordWithOtp({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
      }).unwrap();

      toast.success(res?.message || 'Password reset successfully! Please log in.');
      setIsForgotModalOpen(false);
      setLoginInput((prev) => ({ ...prev, email: resetEmail.trim(), password: '' }));
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[82vh] bg-gradient-to-b from-gray-50 to-indigo-50/20 px-4 sm:px-6 py-10">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 transition-all duration-300">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
            <i className="fas fa-lock-open"></i>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Login to EduCenter</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Please enter your credentials to continue.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email address
            </label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="email"
                name="email"
                value={loginInput.email}
                id="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition shadow-sm"
                placeholder="you@example.com"
                onChange={changeInputHandler}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginInput.password}
                onChange={changeInputHandler}
                id="password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition shadow-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-xs sm:text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleOpenForgotModal}
              className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer text-xs sm:text-sm"
            >
              Forgot password?
            </button>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <i className="fas fa-sign-in-alt text-xs"></i>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign up here
          </Link>
        </p>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {isForgotModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSendingResetOtp && !isResettingPassword) {
              setIsForgotModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/70 backdrop-blur-sm flex justify-center items-center p-4 py-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn relative p-6 sm:p-8">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-xs"></i>
            </button>

            {/* Modal Stage 1: Request OTP */}
            {forgotStep === 1 && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                    <i className="fas fa-key"></i>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Reset Your Password</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Enter your registered email address and we'll send you a 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition shadow-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSendingResetOtp}
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSendingResetOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Reset Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <i className="fas fa-paper-plane text-xs"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Modal Stage 2: Enter OTP & New Password */}
            {forgotStep === 2 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Set New Password</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Code sent to <span className="font-bold text-gray-800 break-all">{sentToEmail || resetEmail}</span>
                  </p>
                  {isAdminReset && sentToEmail && sentToEmail !== resetEmail && (
                    <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-left leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-800">
                        <i className="fas fa-shield-alt text-amber-600"></i>
                        <span>Admin Account Protected</span>
                      </div>
                      <span>
                        For security, the verification code was sent to the official Admin email: <strong>{sentToEmail}</strong>
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setForgotStep(1)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-edit text-[10px]"></i>
                    <span>Change email</span>
                  </button>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-center text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Enter 6-Digit Code
                    </label>
                    <OtpInput
                      value={resetOtp}
                      onChange={setResetOtp}
                      length={6}
                      disabled={isResettingPassword}
                      autoFocus={true}
                    />
                  </div>

                  {/* Countdown / Resend Option */}
                  <div className="text-center text-xs text-gray-500">
                    {isResetCountingDown ? (
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <i className="far fa-clock text-purple-500"></i>
                        <span>Resend code in <strong>{resetCountdown}s</strong></span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendResetCode}
                        disabled={isSendingResetOtp}
                        className="font-semibold text-purple-600 hover:text-purple-800 cursor-pointer disabled:opacity-60"
                      >
                        {isSendingResetOtp ? 'Sending code...' : "Didn't receive code? Resend"}
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition shadow-sm"
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <i className={`fas ${showResetPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-check-double absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition shadow-sm"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isResettingPassword || resetOtp.length < 6}
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResettingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check text-xs"></i>
                        <span>Reset Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;