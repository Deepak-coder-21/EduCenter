import React from 'react';
import { Link } from 'react-router-dom';
import { useGetSettingsQuery } from '../features/api/authApi';

const defaultContact = {
  address: 'EduCenter Head Office, Station Road, Madhubani, Bihar 847211',
  phone: '+91 123 456 7890',
  email: 'info@educenter.com',
  businessHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
};

const defaultSocialLinks = {
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  linkedin: 'https://linkedin.com',
  youtube: 'https://youtube.com',
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data } = useGetSettingsQuery();

  const settings = data?.settings || {};
  const contact = settings.contact || {};
  const socialLinks = settings.socialLinks || defaultSocialLinks;

  // Resolved dynamic values with fallbacks
  const platformName = settings.platformName || 'EduCenter';
  const tagline =
    settings.tagline ||
    settings?.about?.heroSubtitle ||
    'Empowering students with quality education, accessible resources, and expert mentorship.';
  const phone = contact.phone || settings.contactPhone || defaultContact.phone;
  const email = contact.email || settings.supportEmail || defaultContact.email;
  const address = contact.address || defaultContact.address;
  const businessHours = contact.businessHours || defaultContact.businessHours;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden font-sans border-t border-slate-800/80">
      {/* Top glowing ambient highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      <div className="container mx-auto px-6 py-8">
        {/* Main Compact Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          {/* Col 1: Brand & Tagline & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition duration-200">
                <i className="fas fa-graduation-cap text-sm"></i>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                {platformName}
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed pr-2 line-clamp-2">
              {tagline}
            </p>

            {/* Social Media Links */}
            <div className="flex flex-wrap gap-2 pt-1">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition text-xs"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition text-xs"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-blue-700 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition text-xs"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition text-xs"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Academics (2.5 cols) */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
              Academics
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-400 hover:text-indigo-400 transition">
                  Articles & Notes
                </Link>
              </li>
              <li>
                <Link to="/my-learning" className="text-slate-400 hover:text-indigo-400 transition">
                  My Learning
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Information (2.5 cols) */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
              Company
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-indigo-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-indigo-400 transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-indigo-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-indigo-400 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: DYNAMIC Contact Us (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
              Contact
            </h4>

            <div className="space-y-2 text-xs">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <i className="fas fa-phone-alt text-indigo-400 w-3.5 text-center"></i>
                <a href={`tel:${phone}`} className="text-slate-300 hover:text-indigo-400 transition">
                  {phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <i className="fas fa-envelope text-purple-400 w-3.5 text-center"></i>
                <a href={`mailto:${email}`} className="text-slate-300 hover:text-indigo-400 transition break-all">
                  {email}
                </a>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt text-emerald-400 w-3.5 text-center mt-0.5 shrink-0"></i>
                <span className="text-slate-400 leading-snug line-clamp-2">
                  {address.replace(/\n/g, ', ')}
                </span>
              </div>

              {/* Working Hours */}
              {businessHours && (
                <div className="flex items-center gap-2">
                  <i className="fas fa-clock text-amber-400 w-3.5 text-center"></i>
                  <span className="text-slate-400">
                    {businessHours.replace(/\n/g, ' • ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Policies & Back to Top */}
        <div className="pt-5 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            &copy; {currentYear} {platformName}. All Rights Reserved. | Developed by{' '}
            <span className="text-slate-200 font-semibold">Deepak kumar</span>
          </p>

          <div className="flex items-center gap-3">
            <Link to="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <span className="text-slate-700">•</span>
            <Link to="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <span className="text-slate-700">•</span>
            <Link to="/contact" className="hover:text-white transition">
              Help
            </Link>
            <span className="text-slate-700">•</span>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
            >
              <span>Top</span>
              <i className="fas fa-arrow-up text-[9px]"></i>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
