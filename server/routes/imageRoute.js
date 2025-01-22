const express = require("express")
const router = express.Router()
const upload = require("../middlewares/multer");


const {
    imageUpload,
    }=require("../controllers/imageCtrl")

router.post("/upload",upload,imageUpload)
// export all router
module.exports = router


