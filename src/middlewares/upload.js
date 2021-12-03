const multer = require('multer');
const createError = require('http-errors');

const HTTP_CODE = require('../constants/http-codes');
const { getFileSize } = require('../utils/general');

const uploadSingleImage = (fileName) => {
  const multerStorage = multer.memoryStorage();
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(
        createError(
          HTTP_CODE.BAD_REQUEST,
          'Not an image! Please upload only images.'
        ),
        false
      );
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
      fileSize: getFileSize(fileName),
    },
  });

  return upload.single(fileName);
};

module.exports = { uploadSingleImage };
