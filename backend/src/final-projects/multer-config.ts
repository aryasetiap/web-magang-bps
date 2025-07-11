import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const finalProjectStorage = diskStorage({
  destination: './uploads/final-projects',
  filename: (req, file, callback) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

export const finalProjectFileFilter = (req, file, callback) => {
  // Only allow PDF and DOC files
  if (
    file.mimetype.match(
      /\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
    )
  ) {
    callback(null, true);
  } else {
    callback(new Error('Only PDF and DOC files are allowed!'), false);
  }
};

export const finalProjectLimits = {
  fileSize: 10 * 1024 * 1024, // 10MB
};
