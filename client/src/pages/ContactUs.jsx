import React, { useState } from 'react';
import { useGetSettingsQuery } from '../features/api/authApi';
import { toast } from 'react-toastify';

const defaultContact = {
  headerTitle: 'Get in Touch',
  headerSubtitle: "We'd love to hear from you! Whether you have a question about our courses, partnerships, or anything else, our team is ready to answer all your questions.",
  address: 'EduCenter Head Office,\nStation Road, Madhubani,\nBihar, 847211, India',
  phone: '+91 123 456 7890',
  email: 'info@educenter.com',
  businessHours: 'Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed',
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57211.94723023067!2d86.03961384358983!3d26.360156942733977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ee75975e8d1531%3A0x8b79245e9fceda2!2sMadhubani%2C%20Bihar!5e0!3m2!1sen!2sin!4v1655026857853!5m2!1sen!2sin',
};

function ContactUs() {
  const { data } = useGetSettingsQuery();
  const contact = {
    ...defaultContact,
    ...(data?.settings?.contact || {}),
  };

  const [messageForm, setMessageForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success('Thank you for reaching out! Your message has been sent successfully.');
      setMessageForm({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 600);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            {contact.headerTitle}
          </h1>
          <p className="text-lg md:text-xl mt-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {contact.headerSubtitle}
          </p>
        </div>
      </header>

      {/* Contact Section */}
      <main className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSendMessage}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="first-name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      required
                      value={messageForm.firstName}
                      onChange={(e) => setMessageForm({ ...messageForm, firstName: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      required
                      value={messageForm.lastName}
                      onChange={(e) => setMessageForm({ ...messageForm, lastName: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={messageForm.email}
                    onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    required
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="md:col-span-5 space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <ul className="space-y-5 text-gray-600 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                      <strong className="text-gray-900 block mb-0.5">Campus / Office Address:</strong>
                      <span className="whitespace-pre-line leading-relaxed text-xs text-gray-600">
                        {contact.address}
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fas fa-phone-alt"></i>
                    </div>
                    <div>
                      <strong className="text-gray-900 block mb-0.5">Phone Support:</strong>
                      <a href={`tel:${contact.phone}`} className="text-indigo-600 font-medium hover:underline text-xs">
                        {contact.phone}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                      <strong className="text-gray-900 block mb-0.5">Email Inquiries:</strong>
                      <a href={`mailto:${contact.email}`} className="text-indigo-600 font-medium hover:underline text-xs">
                        {contact.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <strong className="text-gray-900 block mb-0.5">Operating Hours:</strong>
                      <span className="whitespace-pre-line text-xs text-gray-600 leading-relaxed">
                        {contact.businessHours}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Map Embed */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <iframe
                  src={contact.mapUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="EduCenter Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ContactUs;
