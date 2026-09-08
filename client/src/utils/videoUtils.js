/**
 * Utility function to extract embed details from YouTube, Vimeo, or direct video URLs.
 */
export const getVideoEmbedInfo = (url) => {
  if (!url || typeof url !== 'string') {
    return { type: 'none', embedUrl: '', rawUrl: '' };
  }

  const trimmed = url.trim();

  // YouTube matchers:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const ytMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      rawUrl: trimmed,
    };
  }

  // Vimeo matchers:
  // - https://vimeo.com/VIDEO_ID
  // - https://player.vimeo.com/video/VIDEO_ID
  const vimeoMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i
  );
  const vimeoId = vimeoMatch ? vimeoMatch[1] || vimeoMatch[2] : null;
  if (vimeoId) {
    return {
      type: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0`,
      rawUrl: trimmed,
    };
  }

  // Direct video file (Cloudinary, AWS S3, MP4, WebM, etc.)
  return {
    type: 'direct',
    embedUrl: trimmed,
    rawUrl: trimmed,
  };
};
