import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const certificateStorage = diskStorage({
  destination: './uploads/certificates/signed', // Signed certificates
  filename: (req, file, callback) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

export const certificateFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  // Only allow PDF files for signed certificates
  if (file.mimetype === 'application/pdf') {
    callback(null, true);
  } else {
    callback(new Error('Only PDF files are allowed for certificates!'), false);
  }
};

export const certificateLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};
