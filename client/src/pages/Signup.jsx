import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSendSignupOtpMutation, useVerifySignupOtpMutation } from '../features/api/authApi';
import { toast } from 'react-toastify';
import OtpInput from '../components/OtpInput';

function Signup() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Step 1: Enter details, Step 2: Verify OTP
  const [step, setStep] = useState(1);

  const [signupInput, setSignupInput] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const [sendSignupOtp, { isLoading: isSendingOtp }] = useSendSignupOtpMutation();
  const [verifySignupOtp, { isLoading: isVerifying }] = useVerifySignupOtpMutation();

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdown]);

  // If already authenticated, redirect away from signup
  if (isAuthenticated && user) {
    const dest = user.role === 'Admin' || user.role === 'Instructor' ? '/admin' : '/';
    return <Navigate to={dest} replace />;
  }

  const changeInputHandler = (e) => {
    setSignupInput({
      ...signupInput,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Send OTP to Email
  const handleInitiateSignup = async (e) => {
    e.preventDefault();

    if (!signupInput.name.trim() || !signupInput.email.trim() || !signupInput.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (signupInput.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (signupInput.password !== signupInput.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const res = await sendSignupOtp({
        email: signupInput.email.trim(),
        name: signupInput.name.trim(),
      }).unwrap();

      toast.success(res?.message || 'Verification code sent to your email!');
      setStep(2);
      setCountdown(60);
      setIsCountingDown(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send verification code. Please check your email and try again.');
    }
  };

  // Step 2: Verify OTP and Register User
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      const res = await verifySignupOtp({
        name: signupInput.name.trim(),
        email: signupInput.email.trim(),
        password: signupInput.password,
        otp: otp.trim(),
      }).unwrap();

      toast.success(res?.message || 'Account verified! Please log in.');
      navigate('/login', { state: { email: signupInput.email.trim() } });
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid or expired code. Please try again.');
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (isCountingDown || isSendingOtp) return;
    try {
      const res = await sendSignupOtp({
        email: signupInput.email.trim(),
        name: signupInput.name.trim(),
      }).unwrap();

      toast.success(res?.message || 'New verification code sent!');
      setOtp('');
      setCountdown(60);
      setIsCountingDown(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[82vh] bg-gradient-to-b from-gray-50 to-indigo-50/20 px-4 sm:px-6 py-10">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 transition-all duration-300">
        
        {/* Step 1: Initial Registration Details */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                <i className="fas fa-user-plus"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Your Account</h2>
              <p className="text-sm text-gray-500 mt-1">
                Join EduCenter and accelerate your academic journey
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleInitiateSignup}>
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    name="name"
                    value={signupInput.name}
                    onChange={changeInputHandler}
                    id="name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition shadow-sm"
                    placeholder="Deepak Kumar"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="email"
                    name="email"
                    value={signupInput.email}
                    onChange={changeInputHandler}
                    id="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition shadow-sm"
                    placeholder="you@example.com"
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
                    value={signupInput.password}
                    onChange={changeInputHandler}
                    id="password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition shadow-sm"
                    placeholder="At least 6 characters"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <i className="fas fa-check-double absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={signupInput.confirmPassword}
                    onChange={changeInputHandler}
                    id="confirmPassword"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition shadow-sm"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <button
                disabled={isSendingOtp}
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSendingOtp ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Email Verification</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Log in here
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Enter 6-Digit OTP */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verify Your Email</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                We sent a 6-digit code to{' '}
                <span className="font-bold text-gray-800 break-all">{signupInput.email}</span>
              </p>
              <button
                onClick={() => setStep(1)}
                className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <i className="fas fa-edit text-[10px]"></i>
                <span>Change email</span>
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-center text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Enter 6-Digit Code
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  disabled={isVerifying}
                  autoFocus={true}
                />
              </div>

              {/* Countdown / Resend Option */}
              <div className="text-center text-xs text-gray-500">
                {isCountingDown ? (
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <i className="far fa-clock text-indigo-500"></i>
                    <span>Resend code in <strong>{countdown}s</strong></span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer disabled:opacity-60"
                  >
                    {isSendingOtp ? 'Sending code...' : "Didn't receive code? Resend"}
                  </button>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  disabled={isVerifying || otp.length < 6}
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying & Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check text-xs"></i>
                      <span>Verify & Complete Registration</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Back to Registration Details
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export default Signup;