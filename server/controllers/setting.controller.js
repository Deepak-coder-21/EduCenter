import Setting from '../models/setting.js';

// Get platform settings (public or admin)
export const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch platform settings' });
    }
};

// Update platform settings (Admin only)
export const updateSettings = async (req, res) => {
    try {
        const {
            platformName,
            tagline,
            supportEmail,
            contactPhone,
            currency,
            announcementBanner,
            enableRegistration,
            maintenanceMode,
            about,
            contact,
            socialLinks,
        } = req.body;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting({});
        }

        if (platformName !== undefined) settings.platformName = platformName;
        if (tagline !== undefined) settings.tagline = tagline;
        if (supportEmail !== undefined) {
            settings.supportEmail = supportEmail;
            if (!settings.contact) settings.contact = {};
            settings.contact.email = supportEmail;
        }
        if (contactPhone !== undefined) {
            settings.contactPhone = contactPhone;
            if (!settings.contact) settings.contact = {};
            settings.contact.phone = contactPhone;
        }
        if (currency !== undefined) settings.currency = currency;
        if (announcementBanner !== undefined) settings.announcementBanner = announcementBanner;
        if (enableRegistration !== undefined) settings.enableRegistration = Boolean(enableRegistration);
        if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);

        if (about !== undefined) {
            settings.about = {
                ...(settings.about?.toObject ? settings.about.toObject() : settings.about || {}),
                ...about,
            };
        }

        if (contact !== undefined) {
            settings.contact = {
                ...(settings.contact?.toObject ? settings.contact.toObject() : settings.contact || {}),
                ...contact,
            };
            // Also sync top-level contactPhone and supportEmail if provided in contact
            if (contact.phone) settings.contactPhone = contact.phone;
            if (contact.email) settings.supportEmail = contact.email;
        }

        if (socialLinks !== undefined) {
            settings.socialLinks = {
                ...(settings.socialLinks?.toObject ? settings.socialLinks.toObject() : settings.socialLinks || {}),
                ...socialLinks,
            };
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            message: 'Page content and settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ success: false, message: 'Failed to update platform settings' });
    }
};
