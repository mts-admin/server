const fs = require('fs');
const sharp = require('sharp');
const slugify = require('slugify');

const { getFileResolution } = require('./general');

const uploadSingleImage = async ({ file, type, name }) => {
  if (!file) return;

  const slugName = slugify(name, { lower: true });

  const fileName = `${slugName}-${file.fieldname}-${Date.now()}.jpeg`;
  const filePath = `/img/${type}/${fileName}`;
  const rootPath = `${__dirname}/../public/${filePath}`;

  try {
    await sharp(file.buffer)
      .resize(...getFileResolution(type))
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(rootPath);

    return filePath;
  } catch (error) {
    throw new Error(error);
  }
};

const removeSingleImage = (path) =>
  path &&
  fs.unlinkSync(`${__dirname}/../public/${path}`, (err) => {
    if (err) {
      throw new Error(err);
    }
  });

const updateSingleImage = ({ file, type, name, oldLink }) => {
  if (!file) return;

  if (oldLink) removeSingleImage(oldLink);

  return uploadSingleImage({ file, type, name });
};

module.exports = { uploadSingleImage, updateSingleImage, removeSingleImage };
