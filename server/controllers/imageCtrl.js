const { uploadImageToCloudinary } = require("../helper/imageUploader");
const getDataUri = require("../middlewares/daraUri");

exports.imageUpload = async (req, res) => {
  try {
    console.log("first")
    // console.log(req.files[0])
    // console.log(req.file)

    const data = getDataUri(req.files[0])
    console.log(data)
 
    const thumbnailImage = await uploadImageToCloudinary(
      data.content,
      process.env.FOLDER_NAME
    );

    res.status(200).json({
      success: true,
      message: "Image upload successfully",
      thumbnailImage,
    });
  } catch (error) {
    console.log(error)
  }
};

