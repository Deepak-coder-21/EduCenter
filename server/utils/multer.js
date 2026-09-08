import multer from 'multer';
import fs from 'fs';

// Ensure uploads folder exists in serverless/container environments
if (!fs.existsSync('uploads')) {
  try {
    fs.mkdirSync('uploads', { recursive: true });
  } catch (err) {
    console.warn('Could not auto-create uploads directory:', err);
  }
}

const upload = multer({ dest: 'uploads/' });
export default upload;

