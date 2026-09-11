import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useGetCourseByIdQuery,
  useGetCoursePurchaseStatusQuery,
  useCreateCheckoutOrderMutation,
  useVerifyPurchasePaymentMutation,
} from '../features/api/authApi';
import { openRazorpayCheckout } from '../utils/razorpay';
import courseData from '../data/courses.json';
import VideoPlayer from '../components/VideoPlayer';

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Queries
  const { data: apiData, isLoading, refetch: refetchCourse } = useGetCourseByIdQuery(id, {
    skip: !id || id.length < 10,
  });

  const { data: purchaseStatus, refetch: refetchPurchaseStatus } = useGetCoursePurchaseStatusQuery(id, {
    skip: !isAuthenticated || !id || id.length < 10,
  });

  const [createCheckoutOrder, { isLoading: isCheckingOut }] = useCreateCheckoutOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPurchasePaymentMutation();

  const staticCourse = courseData.find((c) => c.id === id);
  const course = apiData?.course || staticCourse;

  // Active playlist video selection
  const lectures = course?.lectures || [];
  const [activeLectureIndex, setActiveLectureIndex] = useState(0);

  // If lectures load and none was selected, default to the first lecture
  const activeLecture = lectures[activeLectureIndex] || lectures[0] || null;

  // Is user enrolled or course creator?
  const isCreator = user && course?.creator?._id === user._id;
  const isEnrolled = !!purchaseStatus?.isEnrolled || isCreator;

  // Can the user play the active video?
  // Playable if: video is free preview OR user is enrolled
  const isVideoPlayable = activeLecture?.isPreviewFree || isEnrolled;

  const handleSelectLecture = (index) => {
    setActiveLectureIndex(index);
    // Smooth scroll to video player on mobile
    const playerEl = document.getElementById('video-player-container');
    if (playerEl && window.innerWidth < 768) {
      playerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnrollOrBuy = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to enroll in this course.');
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      toast.info('You are already enrolled in this course!');
      return;
    }

    try {
      const res = await createCheckoutOrder(course._id).unwrap();

      // Free Course Instant Enrollment
      if (res.isFree) {
        toast.success(res.message || 'Enrolled successfully!');
        refetchPurchaseStatus();
        refetchCourse();
        return;
      }

      // Paid Course Razorpay Checkout
      await openRazorpayCheckout({
        orderId: res.orderId,
        amountInPaise: res.amountInPaise,
        currency: res.currency,
        keyId: res.keyId,
        courseTitle: res.courseTitle,
        userName: user?.name,
        userEmail: user?.email,
        onSuccess: async (paymentData) => {
          try {
            await verifyPayment({
              courseId: course._id,
              ...paymentData,
            }).unwrap();

            toast.success('🎉 Payment successful! All course videos are now unlocked.');
            refetchPurchaseStatus();
            refetchCourse();
          } catch (verErr) {
            toast.error(verErr?.data?.message || 'Payment verification failed.');
          }
        },
        onDismiss: (reason) => {
          if (reason) toast.warn(reason);
        },
      });
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to initiate checkout.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">The requested course could not be located or has been unpublished.</p>
          <Link
            to="/courses"
            className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const title = course.courseTitle || course.title;
  const description = course.description || course.subTitle || 'Comprehensive lessons and study resources.';
  const image = course.courseThumbnail || course.image || 'https://placehold.co/600x400/A5B4FC/3730A3?text=EduCenter+Course';
  const instructor = course.creator?.name || course.instructor || 'Prof. Sameer Ahmed';
  const category = course.category || 'General';
  const level = course.courseLevel || 'Beginner';
  const price = course.coursePrice !== undefined ? course.coursePrice : 0;

  return (
    <main className="py-10 md:py-14 bg-gradient-to-b from-indigo-950 via-slate-900 to-gray-900 text-white min-h-[90vh]">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-indigo-300 hover:text-white text-sm font-semibold transition"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            <span>All Courses</span>
          </Link>

          {isEnrolled && (
            <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <i className="fas fa-check-circle"></i> Enrolled Student Access
            </span>
          )}
        </div>

        {/* Course Header Banner */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              {category}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
              {level}
            </span>
            {lectures.length > 0 && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
                <i className="fas fa-video mr-1"></i> {lectures.length} Lessons Playlist
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h1>

          {course.subTitle && (
            <p className="text-base sm:text-lg text-indigo-200 font-medium max-w-3xl">
              {course.subTitle}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-300 pt-1">
            <div className="flex items-center gap-2">
              <i className="fas fa-chalkboard-teacher text-indigo-400"></i>
              <span>Instructor: <strong className="text-white">{instructor}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-gray-300">
              <i className="fas fa-users text-indigo-400"></i>
              <span>{course.enrolledStudents?.length || 0} Enrolled</span>
            </div>
          </div>
        </div>

        {/* Video Player & Curriculum Playlist Area */}
        <div id="video-player-container" className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start mb-12">
          {/* Main Video Player Screen (Column 1 - 7/8 cols) */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="bg-black/90 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
              {/* If course has lectures and an active lecture is selected */}
              {activeLecture ? (
                <div className="relative aspect-video flex items-center justify-center bg-black">
                  {isVideoPlayable ? (
                    // Playable Video (YouTube, Vimeo, Cloudinary, MP4)
                    <VideoPlayer
                      url={activeLecture.videoUrl}
                      poster={image}
                      autoPlay={false}
                      title={activeLecture.lectureTitle}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    // Locked Video Overlay
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-black via-gray-900/90 to-black">
                      {/* Frosted Thumbnail background preview */}
                      <img
                        src={image}
                        alt="Locked Lesson Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
                      />

                      <div className="relative z-10 max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/10 animate-bounce">
                          <i className="fas fa-lock"></i>
                        </div>

                        <div>
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                            Premium Locked Lecture
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                            {activeLecture.lectureTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
                            This lesson is part of the full curriculum. Unlock this video and the entire course with lifetime access.
                          </p>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleEnrollOrBuy}
                            disabled={isCheckingOut || isVerifying}
                            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:scale-105 inline-flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <i className="fas fa-unlock"></i>
                            <span>
                              Unlock All Videos • {price > 0 ? `₹${price}` : 'Free Enroll'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Free Preview Tag overlay on video */}
                  {activeLecture.isPreviewFree && (
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                      <span className="px-3 py-1 bg-emerald-600/90 backdrop-blur-md text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <i className="fas fa-gift text-xs"></i> Free Preview Video
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                // No lectures uploaded yet placeholder
                <div className="aspect-video relative flex items-center justify-center">
                  <img src={image} alt={title} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent flex items-end p-6">
                    <p className="text-sm text-indigo-200 font-semibold">
                      Course trailer & curriculum lectures are being uploaded by the instructor.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Currently Active Lecture Information */}
            {activeLecture && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">
                      Lesson #{activeLectureIndex + 1}
                    </span>
                    {activeLecture.isPreviewFree ? (
                      <span className="text-[11px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/30">
                        Free Preview
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold border border-amber-500/30">
                        {isEnrolled ? 'Unlocked' : 'Locked'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {activeLecture.lectureTitle}
                  </h2>
                  {activeLecture.description && (
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {activeLecture.description}
                    </p>
                  )}
                </div>

                {activeLecture.duration && (
                  <div className="text-xs text-indigo-300 shrink-0 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <i className="far fa-clock"></i>
                    <span>{activeLecture.duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Course Overview & Notes */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-lg font-bold text-white">Course Overview</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          {/* Right Column: Curriculum Playlist & Enrollment Checkout Card (4/5 cols) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            {/* Enrollment & Pricing Box */}
            <div className="bg-white text-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Course Fee
                  </span>
                  <div className="text-3xl font-extrabold text-indigo-700">
                    {price > 0 ? `₹${price}` : 'Free Access'}
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Lifetime Access
                </span>
              </div>

              {/* Action Button: Enroll or Enrolled state */}
              {isEnrolled ? (
                <div className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 text-center flex items-center justify-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  <span>You are Enrolled!</span>
                </div>
              ) : (
                <button
                  onClick={handleEnrollOrBuy}
                  disabled={isCheckingOut || isVerifying}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition text-center flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  {isCheckingOut || isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-graduation-cap"></i>
                      <span>{price > 0 ? `Enroll Now (₹${price})` : 'Enroll for Free'}</span>
                    </>
                  )}
                </button>
              )}

              {/* Course Perks Checklist */}
              <ul className="space-y-2.5 text-xs text-gray-600 pt-4 border-t border-gray-100">
                <li className="flex items-center gap-2.5">
                  <i className="fas fa-video text-indigo-600"></i> Full HD Video Lessons Playlist
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="fas fa-unlock text-indigo-600"></i> Free Preview Lecture Available
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="fas fa-shield-alt text-indigo-600"></i> Secure Payment (Razorpay)
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="fas fa-certificate text-indigo-600"></i> Completion Certificate
                </li>
              </ul>
            </div>

            {/* Video Curriculum / Playlist Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fas fa-list text-indigo-400 text-sm"></i>
                  <h3 className="font-bold text-base text-white">Course Curriculum</h3>
                </div>
                <span className="text-xs text-indigo-300 font-semibold">
                  {lectures.length} {lectures.length === 1 ? 'Lesson' : 'Lessons'}
                </span>
              </div>

              {lectures.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  <p>No video lessons uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {lectures.map((lecture, idx) => {
                    const isSelected = idx === activeLectureIndex;
                    const canPlay = lecture.isPreviewFree || isEnrolled;

                    return (
                      <button
                        key={lecture._id}
                        onClick={() => handleSelectLecture(idx)}
                        className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between gap-3 border ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 shadow-md'
                            : 'bg-white/5 hover:bg-white/10 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Play / Lock Icon */}
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                              canPlay
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/10 text-amber-300'
                            }`}
                          >
                            {canPlay ? (
                              <i className={`fas ${isSelected ? 'fa-play' : 'fa-play-circle'}`}></i>
                            ) : (
                              <i className="fas fa-lock"></i>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {idx + 1}. {lecture.lectureTitle}
                            </p>
                            {lecture.duration && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {lecture.duration}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {lecture.isPreviewFree ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                              Free Preview
                            </span>
                          ) : isEnrolled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                              Unlocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                              Locked 🔒
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CourseDetails;