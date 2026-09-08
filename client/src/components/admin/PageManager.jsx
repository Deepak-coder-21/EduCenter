import React, { useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/api/authApi';
import { toast } from 'react-toastify';

const defaultAbout = {
  heroTitle: 'Dedicated to Nurturing the Future of Bihar',
  heroSubtitle: 'We are EduCenter, a team of passionate educators committed to providing high-quality, accessible education to students everywhere.',
  storyTitle: 'Our Story',
  storyParagraph1: 'EduCenter was born from a simple yet powerful idea: every student in Madhubani, and across Bihar, deserves access to the best educational resources, regardless of their location. Our founder, a former student from this very region, understood the challenges of preparing for competitive exams with limited local resources.',
  storyParagraph2: 'Fueled by a passion to give back to the community, we started in 2022 as a small initiative to share notes and video tutorials online. The overwhelming positive response from students inspired us to build this comprehensive platform. Today, EduCenter is a growing online hub for learning, dedicated to empowering students to achieve their dreams and build a brighter future for themselves and our state.',
  storyImage: 'https://placehold.co/600x400/A5B4FC/3730A3?text=Our+Journey',
  missionText: 'To provide affordable, high-quality digital education and mentorship to students, breaking down geographical barriers and creating a level playing field for all.',
  visionText: 'To be the most trusted and effective online learning platform for students in Bihar and beyond, recognized for our commitment to student success and educational excellence.',
};

const defaultContact = {
  headerTitle: 'Get in Touch',
  headerSubtitle: "We'd love to hear from you! Whether you have a question about our courses, partnerships, or anything else, our team is ready to answer all your questions.",
  address: 'EduCenter Head Office,\nStation Road, Madhubani,\nBihar, 847211, India',
  phone: '+91 123 456 7890',
  email: 'info@educenter.com',
  businessHours: 'Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed',
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57211.94723023067!2d86.03961384358983!3d26.360156942733977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ee75975e8d1531%3A0x8b79245e9fceda2!2sMadhubani%2C%20Bihar!5e0!3m2!1sen!2sin!4v1655026857853!5m2!1sen!2sin',
};

const defaultSocialLinks = {
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  linkedin: 'https://linkedin.com',
  youtube: 'https://youtube.com',
};

const PageManager = () => {
  const [activeSubTab, setActiveSubTab] = useState('about');
  const { data, isLoading, isFetching, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [aboutData, setAboutData] = useState(defaultAbout);
  const [contactData, setContactData] = useState(defaultContact);
  const [socialData, setSocialData] = useState(defaultSocialLinks);

  const handleRefresh = async () => {
    try {
      const res = await refetch();
      const s = res.data?.settings || data?.settings;
      if (s) {
        if (s.about) {
          setAboutData({
            heroTitle: s.about.heroTitle || defaultAbout.heroTitle,
            heroSubtitle: s.about.heroSubtitle || defaultAbout.heroSubtitle,
            storyTitle: s.about.storyTitle || defaultAbout.storyTitle,
            storyParagraph1: s.about.storyParagraph1 || defaultAbout.storyParagraph1,
            storyParagraph2: s.about.storyParagraph2 || defaultAbout.storyParagraph2,
            storyImage: s.about.storyImage || defaultAbout.storyImage,
            missionText: s.about.missionText || defaultAbout.missionText,
            visionText: s.about.visionText || defaultAbout.visionText,
          });
        }
        if (s.contact) {
          setContactData({
            headerTitle: s.contact.headerTitle || defaultContact.headerTitle,
            headerSubtitle: s.contact.headerSubtitle || defaultContact.headerSubtitle,
            address: s.contact.address || defaultContact.address,
            phone: s.contact.phone || defaultContact.phone,
            email: s.contact.email || defaultContact.email,
            businessHours: s.contact.businessHours || defaultContact.businessHours,
            mapUrl: s.contact.mapUrl || defaultContact.mapUrl,
          });
        }
        if (s.socialLinks) {
          setSocialData({
            facebook: s.socialLinks.facebook || defaultSocialLinks.facebook,
            twitter: s.socialLinks.twitter || defaultSocialLinks.twitter,
            instagram: s.socialLinks.instagram || defaultSocialLinks.instagram,
            linkedin: s.socialLinks.linkedin || defaultSocialLinks.linkedin,
            youtube: s.socialLinks.youtube || defaultSocialLinks.youtube,
          });
        }
      }
      toast.success('Page contents reloaded from server!');
    } catch (err) {
      toast.error('Failed to reload page content');
    }
  };

  useEffect(() => {
    if (data?.settings) {
      if (data.settings.about) {
        setAboutData({
          heroTitle: data.settings.about.heroTitle || defaultAbout.heroTitle,
          heroSubtitle: data.settings.about.heroSubtitle || defaultAbout.heroSubtitle,
          storyTitle: data.settings.about.storyTitle || defaultAbout.storyTitle,
          storyParagraph1: data.settings.about.storyParagraph1 || defaultAbout.storyParagraph1,
          storyParagraph2: data.settings.about.storyParagraph2 || defaultAbout.storyParagraph2,
          storyImage: data.settings.about.storyImage || defaultAbout.storyImage,
          missionText: data.settings.about.missionText || defaultAbout.missionText,
          visionText: data.settings.about.visionText || defaultAbout.visionText,
        });
      }
      if (data.settings.contact) {
        setContactData({
          headerTitle: data.settings.contact.headerTitle || defaultContact.headerTitle,
          headerSubtitle: data.settings.contact.headerSubtitle || defaultContact.headerSubtitle,
          address: data.settings.contact.address || defaultContact.address,
          phone: data.settings.contact.phone || defaultContact.phone,
          email: data.settings.contact.email || defaultContact.email,
          businessHours: data.settings.contact.businessHours || defaultContact.businessHours,
          mapUrl: data.settings.contact.mapUrl || defaultContact.mapUrl,
        });
      }
      if (data.settings.socialLinks) {
        setSocialData({
          facebook: data.settings.socialLinks.facebook || defaultSocialLinks.facebook,
          twitter: data.settings.socialLinks.twitter || defaultSocialLinks.twitter,
          instagram: data.settings.socialLinks.instagram || defaultSocialLinks.instagram,
          linkedin: data.settings.socialLinks.linkedin || defaultSocialLinks.linkedin,
          youtube: data.settings.socialLinks.youtube || defaultSocialLinks.youtube,
        });
      }
    }
  }, [data]);

  const handleAboutChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeSubTab === 'about') {
        await updateSettings({ about: aboutData }).unwrap();
        toast.success('About Us page updated successfully!');
      } else {
        await updateSettings({ contact: contactData, socialLinks: socialData }).unwrap();
        toast.success('Contact Us & Footer details updated successfully!');
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update page content');
    }
  };

  const handleReset = () => {
    if (data?.settings) {
      if (activeSubTab === 'about' && data.settings.about) {
        setAboutData({
          ...defaultAbout,
          ...data.settings.about,
        });
      } else if (activeSubTab === 'contact') {
        if (data.settings.contact) {
          setContactData({
            ...defaultContact,
            ...data.settings.contact,
          });
        }
        if (data.settings.socialLinks) {
          setSocialData({
            ...defaultSocialLinks,
            ...data.settings.socialLinks,
          });
        }
      }
      toast.info('Form reset to saved content.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Top Banner & Tab Switcher */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-file-alt text-indigo-600"></i>
            <span>Public Pages Content Manager</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Customize the public <strong>About Us</strong> and <strong>Contact Us</strong> pages in real time.
          </p>
        </div>

        {/* Sub-Tab Switcher Buttons & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveSubTab('about')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'about'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-info-circle"></i>
              <span>About Us Page</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('contact')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'contact'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-phone-alt"></i>
              <span>Contact Us Page</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className={`px-3 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-medium ${
              isFetching ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
            }`}
            title="Reload saved page contents"
          >
            <i className={`fas fa-sync-alt text-xs ${isFetching ? 'animate-spin text-indigo-600' : ''}`}></i>
            <span className="hidden sm:inline">{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
          <p className="text-sm text-gray-500">Loading page content...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================= ABOUT US EDIT FORM ================= */}
          {activeSubTab === 'about' && (
            <div className="space-y-6">
              {/* Hero Banner Section */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <i className="fas fa-heading text-indigo-600"></i>
                    <span>Hero Section & Header</span>
                  </h3>
                  <a
                    href="/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Preview Live /about</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Main Headline
                  </label>
                  <input
                    type="text"
                    name="heroTitle"
                    required
                    value={aboutData.heroTitle}
                    onChange={handleAboutChange}
                    placeholder="e.g. Dedicated to Nurturing the Future of Bihar"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    name="heroSubtitle"
                    rows="3"
                    value={aboutData.heroSubtitle}
                    onChange={handleAboutChange}
                    placeholder="Brief intro statement..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>

              {/* Our Story Section */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <i className="fas fa-book-open text-indigo-600"></i>
                  <span>Our Story Section</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Story Title
                    </label>
                    <input
                      type="text"
                      name="storyTitle"
                      value={aboutData.storyTitle}
                      onChange={handleAboutChange}
                      placeholder="Our Story"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Story Image URL
                    </label>
                    <input
                      type="text"
                      name="storyImage"
                      value={aboutData.storyImage}
                      onChange={handleAboutChange}
                      placeholder="https://..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Story - First Paragraph
                  </label>
                  <textarea
                    name="storyParagraph1"
                    rows="3"
                    value={aboutData.storyParagraph1}
                    onChange={handleAboutChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Story - Second Paragraph
                  </label>
                  <textarea
                    name="storyParagraph2"
                    rows="3"
                    value={aboutData.storyParagraph2}
                    onChange={handleAboutChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>

              {/* Mission & Vision Section */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <i className="fas fa-bullseye text-indigo-600"></i>
                  <span>Mission & Vision Statements</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="fas fa-rocket text-indigo-500"></i>
                    <span>Our Mission</span>
                  </label>
                  <textarea
                    name="missionText"
                    rows="3"
                    value={aboutData.missionText}
                    onChange={handleAboutChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="far fa-eye text-indigo-500"></i>
                    <span>Our Vision</span>
                  </label>
                  <textarea
                    name="visionText"
                    rows="3"
                    value={aboutData.visionText}
                    onChange={handleAboutChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ================= CONTACT US EDIT FORM ================= */}
          {activeSubTab === 'contact' && (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <i className="fas fa-heading text-indigo-600"></i>
                    <span>Page Header & Intro</span>
                  </h3>
                  <a
                    href="/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Preview Live /contact</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Header Title
                  </label>
                  <input
                    type="text"
                    name="headerTitle"
                    required
                    value={contactData.headerTitle}
                    onChange={handleContactChange}
                    placeholder="Get in Touch"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Header Subtitle / Tagline
                  </label>
                  <textarea
                    name="headerSubtitle"
                    rows="2"
                    value={contactData.headerSubtitle}
                    onChange={handleContactChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>

              {/* Contact Information & Channels */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <i className="fas fa-address-card text-indigo-600"></i>
                  <span>Contact Details & Operating Hours</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={contactData.phone}
                      onChange={handleContactChange}
                      placeholder="+91 123 456 7890"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactData.email}
                      onChange={handleContactChange}
                      placeholder="info@educenter.com"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Office / Campus Address
                    </label>
                    <textarea
                      name="address"
                      rows="3"
                      value={contactData.address}
                      onChange={handleContactChange}
                      placeholder="Station Road, Madhubani..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Business / Operating Hours
                    </label>
                    <textarea
                      name="businessHours"
                      rows="3"
                      value={contactData.businessHours}
                      onChange={handleContactChange}
                      placeholder="Monday - Saturday: 9:00 AM - 6:00 PM"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Google Maps Embed URL
                  </label>
                  <input
                    type="text"
                    name="mapUrl"
                    value={contactData.mapUrl}
                    onChange={handleContactChange}
                    placeholder="https://www.google.com/maps/embed?..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Paste the 'src' attribute from your Google Maps embed iframe.
                  </p>
                </div>
              </div>

              {/* Social Media Channels */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <i className="fas fa-share-alt text-indigo-600"></i>
                  <span>Social Media Channels (Footer & Public Profile)</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Provide the URLs to your official social media pages. These will be dynamically linked in the website footer.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <i className="fab fa-facebook text-blue-600"></i>
                      <span>Facebook Profile / Page</span>
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={socialData.facebook}
                      onChange={handleSocialChange}
                      placeholder="https://facebook.com/..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <i className="fab fa-x-twitter text-gray-900"></i>
                      <span>Twitter / X</span>
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      value={socialData.twitter}
                      onChange={handleSocialChange}
                      placeholder="https://x.com/..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <i className="fab fa-instagram text-pink-600"></i>
                      <span>Instagram</span>
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={socialData.instagram}
                      onChange={handleSocialChange}
                      placeholder="https://instagram.com/..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <i className="fab fa-linkedin text-blue-700"></i>
                      <span>LinkedIn</span>
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={socialData.linkedin}
                      onChange={handleSocialChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <i className="fab fa-youtube text-red-600"></i>
                      <span>YouTube Channel</span>
                    </label>
                    <input
                      type="url"
                      name="youtube"
                      value={socialData.youtube}
                      onChange={handleSocialChange}
                      placeholder="https://youtube.com/@..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Save {activeSubTab === 'about' ? 'About Us' : 'Contact Us'} Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PageManager;
