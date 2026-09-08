import React, { useState, useEffect } from 'react';
import { useGetBlogsQuery } from '../features/api/authApi';
import { toast } from 'react-toastify';

// Force-download a PDF from any origin using fetch + Blob
const downloadPdf = async (pdfUrl, filename = 'notes.pdf', setDownloading) => {
  if (!pdfUrl) return;
  try {
    setDownloading(true);
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('PDF download error:', err);
    toast.error('Failed to download PDF. Please try again.');
  } finally {
    setDownloading(false);
  }
};

const fallbackBlogs = [
  {
    _id: 'fb1',
    title: 'Mastering the Last Month: Effective Revision Guide',
    author: 'Prof. Sameer Ahmed',
    category: 'EXAM PREPARATION',
    date: '2025-06-12',
    thumbnail: 'https://placehold.co/800x500/A5B4FC/3730A3?text=Exam+Strategy',
    content:
      '<p>Discover proven techniques for time management, prioritizing subjects, and boosting your confidence before board exams. Spaced repetition and active self-testing ensure you retain formulas and critical concepts when it matters most.</p>',
  },
  {
    _id: 'fb2',
    title: 'Active Recall vs. Passive Reading: What Works Best?',
    author: 'Dr. Neha Sharma',
    category: 'LEARNING TECHNIQUES',
    date: '2025-05-28',
    thumbnail: 'https://placehold.co/800x500/93C5FD/1E40AF?text=Smart+Study',
    content:
      '<p>Explore the difference between these study techniques and learn which one can help you retain information better. Research shows that testing yourself on flashcards produces twice the retention compared to rereading highlighted textbooks.</p>',
  },
];

// Helper to extract PDF list from article
const extractArticlePdfs = (article) => {
  if (!article) return [];
  if (article.pdfFiles && Array.isArray(article.pdfFiles) && article.pdfFiles.length > 0) {
    return article.pdfFiles;
  }
  if (article.pdfUrl) {
    return [{
      url: article.pdfUrl,
      name: article.pdfName || 'notes.pdf',
      size: 0,
    }];
  }
  return [];
};

function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);
  const [downloadingUrl, setDownloadingUrl] = useState(null);

  // Prevent background scrolling when article modal is opened on mobile/desktop
  useEffect(() => {
    if (activeArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeArticle]);

  const { data, isLoading } = useGetBlogsQuery({
    search: search || undefined,
    category: category !== 'All' ? category : undefined,
  });

  const backendBlogs = data?.blogs || [];
  const displayBlogs = backendBlogs.length > 0 ? backendBlogs : (category === 'All' && !search ? fallbackBlogs : []);

  return (
    <main className="py-8 sm:py-16 bg-gray-50/50 min-h-[85vh]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Academic Insights & Guides
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            EduCenter Blog & Resources
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            Expert study tips, exam strategies, and educational insights to accelerate your academic journey.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search articles by title, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading articles...</p>
          </div>
        ) : displayBlogs.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 text-2xl mx-auto mb-4">
              <i className="fas fa-newspaper"></i>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">No articles found</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Try adjusting your search query or check back soon for new educational posts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {displayBlogs.map((b) => {
              const pdfList = extractArticlePdfs(b);
              return (
                <div
                  key={b._id}
                  onClick={() => setActiveArticle(b)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col border border-gray-100 cursor-pointer group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        b.thumbnail ||
                        'https://placehold.co/800x500/A5B4FC/3730A3?text=EduCenter+Blog'
                      }
                      alt={b.title}
                      className="w-full h-44 sm:h-52 object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/800x500/A5B4FC/3730A3?text=EduCenter+Blog';
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold text-purple-700 shadow-sm">
                      {b.category || 'EDUCATION'}
                    </span>
                    {/* PDF badge on card */}
                    {pdfList.length > 0 && (
                      <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-red-500 text-white px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold shadow flex items-center gap-1">
                        <i className="fas fa-file-pdf"></i>
                        <span>{pdfList.length > 1 ? `${pdfList.length} PDFs` : 'PDF Notes'}</span>
                      </span>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-purple-600 transition break-words">
                      {b.title}
                    </h2>
                    <div
                      className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-3 leading-relaxed flex-grow prose prose-sm break-words"
                      dangerouslySetInnerHTML={{ __html: b.content }}
                    ></div>

                    <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="truncate mr-2">
                        By <span className="font-semibold text-gray-800">{b.author || 'Admin'}</span>
                      </div>
                      <div className="shrink-0">
                        {new Date(b.createdAt || b.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveArticle(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/70 backdrop-blur-sm flex justify-center items-start sm:items-center p-2.5 sm:p-4 md:p-6 py-4 sm:py-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn my-auto relative flex flex-col">
            {/* Modal Image & Floating Close Button */}
            <div className="relative w-full">
              <img
                src={
                  activeArticle.thumbnail ||
                  'https://placehold.co/800x500/A5B4FC/3730A3?text=EduCenter+Article'
                }
                alt={activeArticle.title}
                className="w-full h-44 sm:h-64 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/800x500/A5B4FC/3730A3?text=EduCenter+Article';
                }}
              />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition shadow-lg z-20 cursor-pointer"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 md:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {activeArticle.category || 'Education'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug break-words">
                {activeArticle.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pb-3 sm:pb-4 border-b border-gray-100">
                <span>
                  By <strong className="text-gray-800">{activeArticle.author || 'Admin'}</strong>
                </span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span>
                  Published on{' '}
                  {new Date(activeArticle.createdAt || activeArticle.date).toLocaleDateString(
                    undefined,
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </span>
              </div>

              {/* Rich Body Content */}
              <div
                className="prose prose-indigo max-w-none text-gray-700 leading-relaxed text-sm sm:text-base space-y-3 sm:space-y-4 pt-1 sm:pt-2 break-words [word-break:break-word] overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block"
                dangerouslySetInnerHTML={{ __html: activeArticle.content }}
              ></div>

              {/* Study Materials & Notes (PDF List) Section */}
              {(() => {
                const pdfs = extractArticlePdfs(activeArticle);
                if (pdfs.length === 0) return null;

                return (
                  <div className="pt-4 sm:pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-file-pdf text-red-500"></i>
                        <span>Study Materials & Notes ({pdfs.length})</span>
                      </h3>
                      <span className="text-[11px] sm:text-xs text-gray-400">PDF downloads</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {pdfs.map((pdf, idx) => (
                        <div
                          key={pdf.url || idx}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-red-50/60 border border-red-200/70 hover:bg-red-50 transition gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <i className="fas fa-file-pdf text-base sm:text-lg"></i>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 truncate" title={pdf.name || 'notes.pdf'}>
                                {pdf.name || `Notes Document ${idx + 1}`}
                              </p>
                              {pdf.size ? (
                                <p className="text-[10px] sm:text-[11px] text-gray-500">
                                  {(pdf.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              downloadPdf(
                                pdf.url,
                                pdf.name || 'notes.pdf',
                                (val) => setDownloadingUrl(val ? pdf.url : null)
                              )
                            }
                            disabled={downloadingUrl === pdf.url}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg sm:rounded-xl shadow-sm transition shrink-0 cursor-pointer active:scale-95"
                          >
                            {downloadingUrl === pdf.url ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-download text-[11px]"></i>
                                <span>Download</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Modal Footer Close Button */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition shadow-sm text-center cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Blog;
