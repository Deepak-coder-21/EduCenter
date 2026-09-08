import React from 'react';
import { getVideoEmbedInfo } from '../utils/videoUtils';

/**
 * Universal Video Player Component
 * Plays YouTube, Vimeo, Cloudinary, and direct MP4/WebM videos seamlessly.
 */
export default function VideoPlayer({
  url,
  poster,
  autoPlay = false,
  title = 'Video player',
  className = 'w-full h-full object-contain',
}) {
  const info = getVideoEmbedInfo(url);

  if (info.type === 'youtube') {
    const srcWithAutoplay = `${info.embedUrl}${autoPlay ? '&autoplay=1' : ''}`;
    return (
      <iframe
        key={info.videoId}
        src={srcWithAutoplay}
        title={title}
        className="w-full h-full rounded-2xl border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (info.type === 'vimeo') {
    const srcWithAutoplay = `${info.embedUrl}${autoPlay ? '&autoplay=1' : ''}`;
    return (
      <iframe
        key={info.videoId}
        src={srcWithAutoplay}
        title={title}
        className="w-full h-full rounded-2xl border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (info.type === 'direct') {
    return (
      <video
        key={info.rawUrl}
        src={info.rawUrl}
        controls
        autoPlay={autoPlay}
        poster={poster}
        className={className}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4">
      <i className="fas fa-video-slash text-3xl mb-2"></i>
      <p className="text-xs">No video URL provided</p>
    </div>
  );
}
