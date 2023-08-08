const authenticate = require("../middleware/authenticate");
const userdb = require("../models/userSchema");
const Complaint = require("../models/complaintSchema");
const express = require("express");
const router = new express.Router();
const multer = require("multer");
const path = require("path");

const fs = require("fs");
const { json } = require("express");

// now we are going to create a storage for multer
//path should be absolute path

let multerpath = path.join(__dirname, "profilepictures");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, multerpath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.put("/profilepic",authenticate,upload.single("profilepic"), async (req,res)=>{
    try {  
        console.log("pfk");

        const user=await userdb.findById(req.userId)
        console.log(user)
        console.log("fjfj",req.file.filename)
        user.pic=req.file.filename

        const saveduser=await user.save();
        res.status(201).json({ status: 201, saveduser });
        
    } catch (error) {
        res.status(402).json(error)
    }
})


/**
 * @swagger
 * /{filename}:
 *   get:
 *     summary: Get user profile picture by filename
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: The filename of the user's profile picture
 *     produces:
 *       - application/octet-stream
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Not Found
 */

router.get("/:filename", (req, res) => {
    const file = path.join(__dirname, "profilepictures", req.params.filename);
    const stream = fs.createReadStream(file);
  
    stream.on("error", (err) => {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });
  
    res.setHeader("Content-Type", "application/octet-stream");
    stream.pipe(res);
  });
module.exports = router