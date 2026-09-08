import React, { useState } from 'react';
import {
  useGetCourseLecturesQuery,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
} from '../../features/api/authApi';
import { toast } from 'react-toastify';
import VideoPlayer from '../VideoPlayer';
import { getVideoEmbedInfo } from '../../utils/videoUtils';

const LectureModal = ({ course, isOpen, onClose }) => {
  const courseId = course?._id;
  const { data, isLoading, isFetching, refetch } = useGetCourseLecturesQuery(courseId, {
    skip: !isOpen || !courseId,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Lectures list refreshed!');
    } catch (err) {
      toast.error('Failed to refresh lectures');
    }
  };

  const [createLecture, { isLoading: isCreating }] = useCreateLectureMutation();
  const [updateLecture] = useUpdateLectureMutation();
  const [deleteLecture] = useDeleteLectureMutation();

  const lectures = data?.lectures || [];

  // Form State for new video upload
  const [lectureTitle, setLectureTitle] = useState('');
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  // Video preview player state
  const [activePreviewLecture, setActivePreviewLecture] = useState(null);

  if (!isOpen || !course) return null;

  const resetForm = () => {
    setLectureTitle('');
    setIsPreviewFree(false);
    setVideoFile(null);
    setVideoUrl('');
    setDuration('');
    setDescription('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file (.mp4, .webm, .mkv)');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!lectureTitle.trim()) {
      toast.error('Please enter a lecture title.');
      return;
    }

    if (uploadMode === 'file' && !videoFile) {
      toast.error('Please choose a video file to upload.');
      return;
    }

    if (uploadMode === 'url' && !videoUrl.trim()) {
      toast.error('Please enter a direct video URL.');
      return;
    }

    const payload = new FormData();
    payload.append('lectureTitle', lectureTitle);
    payload.append('isPreviewFree', isPreviewFree);
    payload.append('duration', duration);
    payload.append('description', description);

    if (uploadMode === 'file' && videoFile) {
      payload.append('video', videoFile);
    } else {
      payload.append('videoUrl', videoUrl);
    }

    try {
      await createLecture({ courseId, formData: payload }).unwrap();
      toast.success(`Lecture "${lectureTitle}" uploaded successfully!`);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to upload lecture video.');
    }
  };

  const handleToggleFree = async (lecture) => {
    try {
      const newFreeState = !lecture.isPreviewFree;
      const payload = new FormData();
      payload.append('isPreviewFree', newFreeState);

      await updateLecture({
        courseId,
        lectureId: lecture._id,
        formData: payload,
      }).unwrap();

      toast.success(
        `Video marked as ${newFreeState ? 'Free Preview (Unlocked for all)' : 'Paid / Locked'}`
      );
      refetch();
    } catch {
      toast.error('Failed to update lecture status.');
    }
  };

  const handleDelete = async (lecture) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${lecture.lectureTitle}"? This will also remove the video from storage.`
      )
    ) {
      try {
        await deleteLecture({ courseId, lectureId: lecture._id }).unwrap();
        toast.success('Lecture deleted successfully');
        if (activePreviewLecture?._id === lecture._id) {
          setActivePreviewLecture(null);
        }
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete lecture');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-gray-100 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
              <i className="fas fa-play-circle"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  Curriculum & Video Manager
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  • {lectures.length} {lectures.length === 1 ? 'Video' : 'Videos'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5 line-clamp-1">
                {course.courseTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Playlist of Uploaded Videos */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Course Videos Playlist
                </h3>
                <p className="text-xs text-gray-500">
                  Mark videos as Free Preview or Paid for enrollment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isFetching}
                className={`text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition ${
                  isFetching ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="Refresh video lectures list"
              >
                <i className={`fas fa-sync-alt ${isFetching ? 'animate-spin' : ''}`}></i>
                <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Video Preview Player (when previewing a video) */}
            {activePreviewLecture && (
              <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-play text-indigo-400 text-xs"></i>
                    <span className="text-xs font-bold truncate max-w-xs">
                      Preview: {activePreviewLecture.lectureTitle}
                    </span>
                  </div>
                  <button
                    onClick={() => setActivePreviewLecture(null)}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-white/10 rounded"
                  >
                    Close Preview
                  </button>
                </div>
                <div className="aspect-video w-full max-h-56 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <VideoPlayer
                    url={activePreviewLecture.videoUrl}
                    autoPlay
                    title={activePreviewLecture.lectureTitle}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Lectures List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-2"></div>
                <p className="text-xs text-gray-500">Loading videos...</p>
              </div>
            ) : lectures.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 p-6">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-film text-xl"></i>
                </div>
                <h4 className="text-sm font-bold text-gray-800">No videos in playlist yet</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Upload your first video on the right. You can mark it as a Free Preview so students can try it out!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lectures.map((lecture, idx) => (
                  <div
                    key={lecture._id}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      activePreviewLecture?._id === lecture._id
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Left: Index + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {lecture.lectureTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lecture.duration && (
                            <span className="text-[11px] text-gray-500">
                              <i className="far fa-clock mr-1"></i>
                              {lecture.duration}
                            </span>
                          )}
                          {lecture.description && (
                            <span className="text-[11px] text-gray-400 truncate max-w-[160px]">
                              {lecture.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Free / Paid Toggle Button */}
                      <button
                        onClick={() => handleToggleFree(lecture)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          lecture.isPreviewFree
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                        }`}
                        title="Click to toggle Free Preview or Paid"
                      >
                        <i
                          className={`fas ${
                            lecture.isPreviewFree ? 'fa-gift' : 'fa-lock'
                          } text-[10px]`}
                        ></i>
                        <span>{lecture.isPreviewFree ? 'Free Preview' : 'Paid / Locked'}</span>
                      </button>

                      {/* Play Preview */}
                      <button
                        onClick={() => setActivePreviewLecture(lecture)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Watch Video"
                      >
                        <i className="fas fa-play text-xs"></i>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(lecture)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Lecture"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Upload New Video One-by-One Form */}
          <div className="lg:col-span-5 bg-gray-50/70 rounded-3xl p-5 border border-gray-200/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <i className="fas fa-cloud-upload-alt text-indigo-600"></i>
                Upload Video (One by One)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Add each lesson to the curriculum playlist.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Lecture Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01: Welcome & Course Intro"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>

              {/* Mode Switch: File Upload vs Direct URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Video Source
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-200/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      uploadMode === 'file'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <i className="fas fa-upload mr-1.5"></i> Video File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      uploadMode === 'url'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <i className="fas fa-link mr-1.5"></i> Direct URL
                  </button>
                </div>
              </div>

              {/* Video File or URL input */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Video File (MP4, WebM, MKV)
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-white rounded-2xl p-4 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-1">
                      <i className="fas fa-video text-indigo-500 text-2xl mb-1"></i>
                      <p className="text-xs font-semibold text-gray-700">
                        {videoFile ? videoFile.name : 'Click or drop video file here'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {videoFile
                          ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : 'Supports MP4, WebM, MOV'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-700">
                      Direct Video URL
                    </label>
                    {videoUrl.trim() && (() => {
                      const detected = getVideoEmbedInfo(videoUrl);
                      if (detected.type === 'youtube') {
                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <i className="fab fa-youtube"></i> YouTube Video
                          </span>
                        );
                      }
                      if (detected.type === 'vimeo') {
                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                            <i className="fab fa-vimeo-v"></i> Vimeo Video
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          <i className="fas fa-file-video"></i> Direct Video Stream
                        </span>
                      );
                    })()}
                  </div>
                  <input
                    type="url"
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/... or .mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                    <span>Supports:</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">YouTube</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">Vimeo</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">Cloudinary</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">MP4 / WebM</span>
                  </div>
                </div>
              )}

              {/* Free vs Paid Toggle Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <i className="fas fa-gift text-emerald-500"></i>
                    Is this video Free Preview?
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPreviewFree}
                      onChange={(e) => setIsPreviewFree(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  {isPreviewFree ? (
                    <span className="text-emerald-600 font-medium">
                      ✓ Anyone can watch this video for free without purchasing the course.
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      🔒 Locked: Only enrolled/paid students can watch this video.
                    </span>
                  )}
                </p>
              </div>

              {/* Duration & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duration (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15:30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`#${lectures.length + 1}`}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Lesson Notes / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key takeaways or summary for this video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading Video... Please wait</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle"></i>
                    <span>Add Video to Playlist</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureModal;
