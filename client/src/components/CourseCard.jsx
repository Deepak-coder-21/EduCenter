// File: src/components/CourseCard.jsx
import { Link } from 'react-router-dom';

function CourseCard({ course }) {
  const title = course.courseTitle || course.title;
  const image =
    course.courseThumbnail ||
    course.image ||
    'https://placehold.co/600x400/A5B4FC/3730A3?text=EduCenter+Course';
  const description = course.description || course.subTitle || 'Comprehensive lessons and study resources.';
  const id = course._id || course.id;
  const category = course.category;
  const level = course.courseLevel;
  const price = course.coursePrice;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col border border-gray-100 group">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400/A5B4FC/3730A3?text=EduCenter+Course';
          }}
        />
        {category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
            {category}
          </span>
        )}
        {level && (
          <span className="absolute top-3 right-3 bg-indigo-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm">
            {level}
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 text-sm line-clamp-2 flex-grow">
          {description}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="font-extrabold text-lg text-indigo-700">
            {price !== undefined ? (price > 0 ? `₹${price}` : 'Free') : 'Enroll Now'}
          </div>
          <Link
            to={`/course/${id}`}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
          >
            <span>Details</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;