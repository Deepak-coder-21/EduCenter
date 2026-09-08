import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/api/authApi';
import { toast } from 'react-toastify';

const defaultSocialLinks = {
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  linkedin: 'https://linkedin.com',
  youtube: 'https://youtube.com',
};

const SettingsManager = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, isFetching, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [formData, setFormData] = useState({
    platformName: '',
    tagline: '',
    supportEmail: '',
    contactPhone: '',
    socialLinks: defaultSocialLinks,
  });

  const handleRefresh = async () => {
    try {
      const res = await refetch();
      const s = res.data?.settings || data?.settings;
      if (s) {
        setFormData({
          platformName: s.platformName || 'EduCenter Online Academy',
          tagline: s.tagline || 'Excellence in Education & Online Learning',
          supportEmail: s.supportEmail || 'support@educenter.com',
          contactPhone: s.contactPhone || '+91 98765 43210',
          socialLinks: {
            facebook: s.socialLinks?.facebook || defaultSocialLinks.facebook,
            twitter: s.socialLinks?.twitter || defaultSocialLinks.twitter,
            instagram: s.socialLinks?.instagram || defaultSocialLinks.instagram,
            linkedin: s.socialLinks?.linkedin || defaultSocialLinks.linkedin,
            youtube: s.socialLinks?.youtube || defaultSocialLinks.youtube,
          },
        });
      }
      toast.success('Settings reloaded from server!');
    } catch (err) {
      toast.error('Failed to reload settings');
    }
  };

  // Populate form when data loads
  useEffect(() => {
    if (data?.settings) {
      setFormData({
        platformName: data.settings.platformName || 'EduCenter Online Academy',
        tagline: data.settings.tagline || 'Excellence in Education & Online Learning',
        supportEmail: data.settings.supportEmail || 'support@educenter.com',
        contactPhone: data.settings.contactPhone || '+91 98765 43210',
        socialLinks: {
          facebook: data.settings.socialLinks?.facebook || defaultSocialLinks.facebook,
          twitter: data.settings.socialLinks?.twitter || defaultSocialLinks.twitter,
          instagram: data.settings.socialLinks?.instagram || defaultSocialLinks.instagram,
          linkedin: data.settings.socialLinks?.linkedin || defaultSocialLinks.linkedin,
          youtube: data.settings.socialLinks?.youtube || defaultSocialLinks.youtube,
        },
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success('Platform settings & branding saved successfully!');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update platform settings');
    }
  };

  const handleReset = () => {
    if (data?.settings) {
      setFormData({
        platformName: data.settings.platformName || 'EduCenter Online Academy',
        tagline: data.settings.tagline || 'Excellence in Education & Online Learning',
        supportEmail: data.settings.supportEmail || 'support@educenter.com',
        contactPhone: data.settings.contactPhone || '+91 98765 43210',
        socialLinks: {
          facebook: data.settings.socialLinks?.facebook || defaultSocialLinks.facebook,
          twitter: data.settings.socialLinks?.twitter || defaultSocialLinks.twitter,
          instagram: data.settings.socialLinks?.instagram || defaultSocialLinks.instagram,
          linkedin: data.settings.socialLinks?.linkedin || defaultSocialLinks.linkedin,
          youtube: data.settings.socialLinks?.youtube || defaultSocialLinks.youtube,
        },
      });
      toast.info('Form reset to saved settings.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Admin Profile Overview */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Administrator Profile</h2>
        <p className="text-xs text-gray-600 mb-6">
          Manage your account credentials, avatar, and personal preferences.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <img
            src={user?.photoUrl || 'https://placehold.co/100x100/6366F1/FFFFFF?text=A'}
            alt={user?.name || 'Admin'}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/100x100/6366F1/FFFFFF?text=A';
            }}
          />
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold text-gray-900">{user?.name || 'Administrator'}</h3>
            <p className="text-sm text-gray-600 mb-2">{user?.email || 'admin@educenter.com'}</p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Role: {user?.role || 'Admin'}
            </span>
          </div>
          <Link
            to="/edit-profile"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
          >
            <i className="fas fa-user-edit"></i>
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Academy Platform Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-sliders-h text-indigo-600"></i>
              <span>Platform Settings & Branding</span>
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Configure global platform branding, contact details, and official social channels. All changes update across the website in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className={`px-3 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-200 transition inline-flex items-center gap-1.5 text-xs font-medium ${
              isFetching ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
            }`}
            title="Reload settings from database"
          >
            <i className={`fas fa-sync-alt text-sm ${isFetching ? 'animate-spin text-indigo-600' : ''}`}></i>
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Platform Identity Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <i className="fas fa-graduation-cap text-indigo-600"></i>
                <span>Platform Identity & Branding</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Platform Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="platformName"
                    required
                    value={formData.platformName}
                    onChange={handleChange}
                    placeholder="e.g. EduCenter Online Academy"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Displayed across the navigation header, website footer, and page titles.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Platform Tagline / Motto
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="e.g. Excellence in Online Education"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Displayed in the footer brand intro and about highlights.
                  </p>
                </div>
              </div>
            </div>

            {/* Official Support & Contact Section */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <i className="fas fa-headset text-indigo-600"></i>
                <span>Official Support & Contact Channels</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Support Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    required
                    value={formData.supportEmail}
                    onChange={handleChange}
                    placeholder="e.g. support@educenter.com"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used for student inquiries and displayed in the website footer.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Direct phone line displayed for student telephone inquiries.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Channels Section */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <i className="fas fa-share-alt text-indigo-600"></i>
                <span>Official Social Media Channels</span>
              </h3>
              <p className="text-xs text-gray-500">
                These links are dynamically rendered in the website footer to connect learners with your community.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="fab fa-facebook text-blue-600"></i>
                    <span>Facebook URL</span>
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="fab fa-x-twitter text-gray-900"></i>
                    <span>Twitter / X URL</span>
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleChange}
                    placeholder="https://x.com/..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="fab fa-instagram text-pink-600"></i>
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="fab fa-linkedin text-blue-700"></i>
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <i className="fab fa-youtube text-red-600"></i>
                    <span>YouTube Channel URL</span>
                  </label>
                  <input
                    type="url"
                    name="youtube"
                    value={formData.socialLinks.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/@..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsManager;
