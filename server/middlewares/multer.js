const multer = require("multer")

const storage = multer.memoryStorage();

// const upload = multer({ storage: storage }).single("file");

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 200MB limit
    onError: (err, next) => {
      console.log('Error during file upload', err);
      next(err);
    }
  }).array('file', 5000);
module.exports = upload;