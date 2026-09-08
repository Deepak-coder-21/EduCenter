import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    platformName: {
        type: String,
        default: 'EduCenter Online Academy',
        trim: true,
    },
    tagline: {
        type: String,
        default: 'Excellence in Education & Online Learning',
        trim: true,
    },
    supportEmail: {
        type: String,
        default: 'support@educenter.com',
        trim: true,
    },
    contactPhone: {
        type: String,
        default: '+91 98765 43210',
        trim: true,
    },
    currency: {
        type: String,
        default: 'INR (₹)',
        trim: true,
    },
    announcementBanner: {
        type: String,
        default: '',
        trim: true,
    },
    enableRegistration: {
        type: Boolean,
        default: true,
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },

    // About Us Page Content
    about: {
        heroTitle: {
            type: String,
            default: 'Dedicated to Nurturing the Future of Bihar',
        },
        heroSubtitle: {
            type: String,
            default: 'We are EduCenter, a team of passionate educators committed to providing high-quality, accessible education to students everywhere.',
        },
        storyTitle: {
            type: String,
            default: 'Our Story',
        },
        storyParagraph1: {
            type: String,
            default: 'EduCenter was born from a simple yet powerful idea: every student in Madhubani, and across Bihar, deserves access to the best educational resources, regardless of their location. Our founder, a former student from this very region, understood the challenges of preparing for competitive exams with limited local resources.',
        },
        storyParagraph2: {
            type: String,
            default: 'Fueled by a passion to give back to the community, we started in 2022 as a small initiative to share notes and video tutorials online. The overwhelming positive response from students inspired us to build this comprehensive platform. Today, EduCenter is a growing online hub for learning, dedicated to empowering students to achieve their dreams and build a brighter future for themselves and our state.',
        },
        storyImage: {
            type: String,
            default: 'https://placehold.co/600x400/A5B4FC/3730A3?text=Our+Journey',
        },
        missionText: {
            type: String,
            default: 'To provide affordable, high-quality digital education and mentorship to students, breaking down geographical barriers and creating a level playing field for all.',
        },
        visionText: {
            type: String,
            default: 'To be the most trusted and effective online learning platform for students in Bihar and beyond, recognized for our commitment to student success and educational excellence.',
        },
    },

    // Contact Us Page Content
    contact: {
        headerTitle: {
            type: String,
            default: 'Get in Touch',
        },
        headerSubtitle: {
            type: String,
            default: "We'd love to hear from you! Whether you have a question about our courses, partnerships, or anything else, our team is ready to answer all your questions.",
        },
        address: {
            type: String,
            default: 'EduCenter Head Office,\nStation Road, Madhubani,\nBihar, 847211, India',
        },
        phone: {
            type: String,
            default: '+91 123 456 7890',
        },
        email: {
            type: String,
            default: 'info@educenter.com',
        },
        businessHours: {
            type: String,
            default: 'Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed',
        },
        mapUrl: {
            type: String,
            default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57211.94723023067!2d86.03961384358983!3d26.360156942733977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ee75975e8d1531%3A0x8b79245e9fceda2!2sMadhubani%2C%20Bihar!5e0!3m2!1sen!2sin!4v1655026857853!5m2!1sen!2sin',
        },
    },

    // Social Media Links
    socialLinks: {
        facebook: {
            type: String,
            default: 'https://facebook.com',
        },
        twitter: {
            type: String,
            default: 'https://twitter.com',
        },
        instagram: {
            type: String,
            default: 'https://instagram.com',
        },
        linkedin: {
            type: String,
            default: 'https://linkedin.com',
        },
        youtube: {
            type: String,
            default: 'https://youtube.com',
        },
    }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
