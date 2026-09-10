import React, { useState, useRef, useEffect } from 'react';
import { getVideoEmbedInfo } from '../utils/videoUtils';

/**
 * Transforms Cloudinary video URLs to stream at different resolutions/bitrates.
 */
const getTransformedVideoUrl = (url, quality) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return url;
  }

  if (quality === 'Auto') {
    // Strip custom resolution tags back to original uploaded video
    return url.replace(/\/video\/upload\/(?:w_\d+[^/]*\/)?/, '/video/upload/');
  }

  const qualityTransforms = {
    '1080p': 'w_1920,c_limit,q_auto:good',
    '720p': 'w_1280,c_limit,q_auto:good',
    '480p': 'w_854,c_limit,q_auto:eco',
    '360p': 'w_640,c_limit,q_auto:low',
  };

  const transform = qualityTransforms[quality] || 'q_auto';

  // Replace existing transform or prepend before version/path
  if (url.match(/\/video\/upload\/(?:w_\d+[^/]*\/)?/)) {
    return url.replace(/\/video\/upload\/(?:w_\d+[^/]*\/)?/, `/video/upload/${transform}/`);
  }

  return url;
};

const QUALITIES = [
  { label: 'Auto (Recommended)', value: 'Auto' },
  { label: '1080p (Full HD)', value: '1080p' },
  { label: '720p (HD)', value: '720p' },
  { label: '480p (SD)', value: '480p' },
  { label: '360p (Data Saver)', value: '360p' },
];

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

/**
 * Universal Video Player Component
 * - Disables download button (controlsList="nodownload")
 * - Disables context-menu right-click downloading
 * - Respects autoplay = false (requires user to initiate play)
 * - Offers dynamic quality switching (Auto, 1080p, 720p, 480p, 360p) & playback speeds
 */
export default function VideoPlayer({
  url,
  poster,
  autoPlay = false,
  title = 'Video player',
  className = 'w-full h-full object-contain',
}) {
  const [quality, setQuality] = useState('Auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('quality'); // 'quality' | 'speed'

  const videoRef = useRef(null);
  const savedTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const menuRef = useRef(null);

  const info = getVideoEmbedInfo(url);

  // Close settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle quality change and preserve current playback timestamp
  const handleQualityChange = (newQuality) => {
    if (videoRef.current) {
      savedTimeRef.current = videoRef.current.currentTime;
      wasPlayingRef.current = !videoRef.current.paused;
    }
    setQuality(newQuality);
    setIsMenuOpen(false);
  };

  // Restore playback state once new source loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current && savedTimeRef.current > 0) {
      videoRef.current.currentTime = savedTimeRef.current;
      if (wasPlayingRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setIsMenuOpen(false);
  };

  if (info.type === 'youtube') {
    const srcWithAutoplay = `${info.embedUrl}${autoPlay ? '&autoplay=1' : ''}`;
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black group">
        <iframe
          key={info.videoId}
          src={srcWithAutoplay}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {/* Quality indicator badge */}
        <div className="absolute top-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow flex items-center gap-1.5">
            <i className="fas fa-cog text-indigo-400"></i> Quality in player settings
          </span>
        </div>
      </div>
    );
  }

  if (info.type === 'vimeo') {
    const srcWithAutoplay = `${info.embedUrl}${autoPlay ? '&autoplay=1' : ''}`;
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black group">
        <iframe
          key={info.videoId}
          src={srcWithAutoplay}
          title={title}
          className="w-full h-full border-0"
          allow="fullscreen; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute top-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow flex items-center gap-1.5">
            <i className="fas fa-cog text-indigo-400"></i> Quality in player settings
          </span>
        </div>
      </div>
    );
  }

  if (info.type === 'direct') {
    const resolvedVideoSrc = getTransformedVideoUrl(info.rawUrl, quality);

    return (
      <div
        className="relative w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden group"
        onContextMenu={(e) => e.preventDefault()}
      >
        <video
          ref={videoRef}
          key={resolvedVideoSrc}
          src={resolvedVideoSrc}
          controls
          controlsList="nodownload"
          disablePictureInPicture={false}
          autoPlay={autoPlay}
          poster={poster}
          onLoadedMetadata={handleLoadedMetadata}
          className={className}
        >
          Your browser does not support the video tag.
        </video>

        {/* Video Quality & Settings Floating Button */}
        <div className="absolute top-3 right-3 z-30" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-black/75 hover:bg-black/90 text-white border border-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
            title="Video Quality and Playback Speed"
            aria-label="Video Quality and Settings"
          >
            <i className="fas fa-sliders-h text-indigo-400 text-[10px]"></i>
            <span className="tracking-wide">{quality === 'Auto' ? 'Quality: Auto' : quality}</span>
            {playbackSpeed !== 1 && (
              <span className="text-amber-400 text-[10px] ml-0.5 font-bold">
                {playbackSpeed}x
              </span>
            )}
          </button>

          {/* Settings Popup Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-gray-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl p-2 z-40 text-white text-xs animate-fadeIn">
              {/* Tab Selector */}
              <div className="flex border-b border-white/10 pb-1.5 mb-2 px-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('quality')}
                  className={`flex-1 py-1 text-center font-bold rounded-lg transition ${
                    activeTab === 'quality'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Quality
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('speed')}
                  className={`flex-1 py-1 text-center font-bold rounded-lg transition ${
                    activeTab === 'speed'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Speed
                </button>
              </div>

              {/* Quality Options List */}
              {activeTab === 'quality' && (
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 py-1">
                    Select Resolution
                  </div>
                  {QUALITIES.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => handleQualityChange(q.value)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        quality === q.value
                          ? 'bg-indigo-600/30 text-indigo-400 font-bold'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{q.label}</span>
                      {quality === q.value && <i className="fas fa-check text-xs"></i>}
                    </button>
                  ))}
                </div>
              )}

              {/* Speed Options List */}
              {activeTab === 'speed' && (
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 py-1">
                    Playback Rate
                  </div>
                  {SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        playbackSpeed === speed
                          ? 'bg-indigo-600/30 text-indigo-400 font-bold'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{speed === 1 ? '1.0x (Normal)' : `${speed}x`}</span>
                      {playbackSpeed === speed && <i className="fas fa-check text-xs"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4 rounded-2xl">
      <i className="fas fa-video-slash text-3xl mb-2"></i>
      <p className="text-xs">No video URL provided</p>
    </div>
  );
}
