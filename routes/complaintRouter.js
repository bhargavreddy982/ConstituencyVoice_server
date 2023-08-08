const authenticate = require("../middleware/authenticate");
const userdb = require("../models/userSchema");
const Complaint = require("../models/complaintSchema");
const express = require("express");
const router = new express.Router();
const multer = require("multer");
const path = require("path");

const mongoose = require("mongoose");
const fs = require("fs");
const { json } = require("express");

// now we are going to create a storage for multer
//path should be absolute path

let multerpath = path.join(__dirname, "uploads");

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
//`http://localhost:5001/complaints/${complaint._id}`,

// router.get("/:id", authenticate, async (req, res) => {
//   try {
//     const complaint = await Complaint.findOne();
//     res.status(201).json(complaint);


/**
 * @swagger
 * /sentComplaints:
 *   get:
 *     summary: Get all sent complaints of authenticated user
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '201':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 complaints:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Complaint'
 *       '422':
 *         $ref: '#/components/responses/UnprocessableEntity'
 */


router.get("/sentComplaints", authenticate, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      user: req.userId,
      status: "sent",
    })
      .populate({
        path: "admins",
        model: userdb,
        select: "_id fname department district",
      })
      .populate({
        path: "user",
        model: userdb,
        select: "_id fname department district",
      })
      .sort({ createdAt: -1 })
      .exec();

    res.status(201).json({ status: 201, complaints });
  } catch (error) {
    console.log(error);
    res.status(422).json(error);
  }
});

router.get("/draftComplaints", authenticate, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      user: req.userId,
      status: "draft",
    });
    res.status(201).json({ status: 201, complaints });
  } catch (error) {
    res.status(422).json(error);
  }
});



/**
 * @swagger
 * /draft/{id}:
 *   put:
 *     summary: Update a draft complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the draft complaint to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the complaint
 *               description:
 *                 type: string
 *                 description: Description of the complaint
 *               user:
 *                 type: string
 *                 description: ID of the user who submitted the complaint
 *             required:
 *               - title
 *               - description
 *               - user
 *     responses:
 *       '201':
 *         description: Draft complaint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: HTTP status code
 *                   example: 201
 *                 savedComplaint:
 *                   $ref: '#/components/schemas/Complaint'
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized request
 *       '404':
 *         description: Draft complaint not found
 *       '422':
 *         description: Unprocessable entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: fill all the details
 *       '500':
 *         description: Internal server error
 */

router.put("/draft/:id", authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    const { title, description, user } = req.body;
    if (!title || !description || !user) {
      res.status(422).json({ error: "fill all the details" });
    } else {
      complaint.title = title;
      complaint.description = description;
      complaint.user = user;
      complaint.status = "draft";
      complaint.admins = [];
      const savedComplaint = await complaint.save();
      res.status(201).json({ status: 201, savedComplaint });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});

/**
 * @swagger
 * /draft:
 *   post:
 *     summary: Create a new draft complaint.
 *     description: Create a new draft complaint with the given title, description and user information.
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               complaintId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               user:
 *                 type: string
 *             required:
 *               - title
 *               - description
 *               - user
 *     responses:
 *       '201':
 *         description: A successful response, returning the saved complaint object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 savedComplaint:
 *                   $ref: '#/components/schemas/Complaint'
 *       '422':
 *         $ref: '#/components/responses/UnprocessableEntity'
 */


router.post("/draft", authenticate, async (req, res) => {
  try {
    console.log(req);
    const { complaintId, title, description, user } = req.body;
    console.log(req.body);
    if (!title || !description || !user) {
      res.status(422).json({ error: "fill all the details" });
    } else {
      const complaint = new Complaint({
        complaintId,
        title,
        description,
        user,
        status: "draft",
        admins: [],
      });
      const savedComplaint = await complaint.save();
      console.log(savedComplaint);

      res.status(201).json({ status: 201, savedComplaint });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});

// attachments are files i want to use multer to upload files

/**
 * @swagger
 * /send/{id}:
 *   put:
 *     summary: Update and send complaint with attachments
 *     tags: [Complaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the complaint
 *       - in: formData
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Title of the complaint
 *       - in: formData
 *         name: description
 *         required: true
 *         schema:
 *           type: string
 *         description: Description of the complaint
 *       - in: formData
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who raised the complaint
 *       - in: formData
 *         name: admins
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: IDs of the admins who should receive the complaint
 *       - in: formData
 *         name: attachments
 *         type: file
 *         description: Attachments to be added to the complaint
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 savedComplaint:
 *                   $ref: '#/components/schemas/Complaint'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


router.put(
  "/send/:id",
  authenticate,
  upload.array("attachments"),
  async (req, res) => {
    try {
      console.log(req.body);
      const complaint = await Complaint.findById(req.params.id);
      console.log(complaint);
      const { complaintId, title, description, user, admins } = req.body;
      if (!title || !description || !user || !admins) {
        res.status(422).json({ error: "fill all the details" });
      } else {
        complaint.title = title;
        complaint.description = description;
        complaint.user = user;
        complaint.status = "sent";
        complaint.admins = admins;
        complaint.attachments = req.files.map((file) => file.filename);
        const savedComplaint = await complaint.save();
        res.status(201).json({ status: 201, savedComplaint });
      }
    } catch (error) {
      res.status(422).json(error);
      console.log("catch block error");
    }
  }
);

/**
 * @swagger
 * /send:
 *   post:
 *     summary: Create a new complaint and send it
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: complaintId
 *         type: string
 *         required: true
 *         description: Unique identifier for the complaint
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: Title of the complaint
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: Description of the complaint
 *       - in: formData
 *         name: user
 *         type: string
 *         required: true
 *         description: User who submitted the complaint
 *       - in: formData
 *         name: admins
 *         type: array
 *         items:
 *           type: string
 *         required: true
 *         description: List of admin IDs who will handle the complaint
 *       - in: formData
 *         name: attachments
 *         type: file
 *         description: Optional file attachments for the complaint
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal Server Error
 */



router.post(
  "/send",
  authenticate,
  upload.array("attachments"),
  async (req, res) => {
    try {
      const { complaintId, title, description, user, admins } = req.body;
      if (!title || !description || !user || !admins) {
        res.status(422).json({ error: "fill all the details" });
      } else {
        const complaint = new Complaint({
          complaintId,
          title,
          description,
          user,
          status: "sent",
          attachments: req.files.map((file) => file.filename),
          admins,
        });
        const savedComplaint = await complaint.save();
        res.status(201).json({ status: 201, savedComplaint });
      }
    } catch (error) {
      res.status(422).json(error);
      console.log(error)
      console.log("catch block error");
    }
  }
);
/**
 * @swagger
 * /uploads/{filename}:
 *   get:
 *     summary: Download a file from the uploads directory.
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to download.
 *     responses:
 *       '200':
 *         description: The file was found and downloaded successfully.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: The requested file was not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */


router.get("/uploads/:filename", (req, res) => {
  const file = path.join(__dirname, "uploads", req.params.filename);
  const stream = fs.createReadStream(file);

  stream.on("error", (err) => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  res.setHeader("Content-Type", "application/octet-stream");
  stream.pipe(res);
});

router.delete("/delete/:id", authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    console.log(complaint)
     const deletedComplaint = await Complaint.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: 200, message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(422).json(error);
  }
});

router.get("/deptComplaints", authenticate, async (req, res) => {
  try {
   const userId = req.userId;
   console.log(userId);
   // check if user is present in admins list of complaint
   const complaints = await Complaint.find({admins : userId}).populate({
    path : "user",
    model : userdb,
   });
   console.log(complaints)
    res.status(200).json({ status: 200, complaints });
  } catch (error) {
    console.log(error);
    res.status(422).json(error);
  }
});

router.put("/resolveComplaint/:id", authenticate, async (req, res) => {
  try {
    console.log("ddjdjdjjdj")
    const complaint = await Complaint.findById(req.params.id);
    complaint.resolved = true;
    let savedComplaint = await complaint.save();
    savedComplaint = await Complaint.findById(req.params.id).populate({
      path: "user",
      model : userdb
    });
    res.status(200).json({ status: 200, savedComplaint });
  } catch (error) {
    console.log(error);
    res.status(422).json(error);
  }
});


router.get('/dept/search',authenticate, async (req, res) => {
  const searchQuery = req.query.q;
  console.log(searchQuery)
  const filter = searchQuery ? {
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      
    ]
    ,
    $and : [
      {admins : req.userId}
    ]
  } : {  };
  const complaints = await Complaint.find(filter).sort({createdAt: -1}).exec();

  console.log(complaints)
  res.json({complaints });
});

router.get('/search',authenticate, async (req, res) => {
  const searchQuery = req.query.q;
  console.log(searchQuery)
  const filter = searchQuery ? {
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      
    ]
  } : { user: new mongoose.Types.ObjectId(req.userId) };
  const complaints = await Complaint.find(filter).sort({createdAt: -1}).exec();

  console.log(complaints)
  res.json({complaints });
});


module.exports = router;
