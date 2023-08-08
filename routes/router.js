const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const keysecret = "yaswanthreddymaguluri";

//email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: "yaswanthreddymaguluri@gmail.com",
    pass: "bbfasstcpxicvdxk",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//for user Registration

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               cpassword:
 *                 type: string
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *               aadhar:
 *                 type: string
 *               isCreatedByAdmin:
 *                 type: boolean
 *             required:
 *               - fname
 *               - email
 *               - password
 *               - cpassword
 *               - district
 *               - state
 *               - aadhar
 *     responses:
 *       '201':
 *         description: User registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                 storeData:
 *                   $ref: '#/components/schemas/User'
 *       '422':
 *         description: Error occurred during registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post("/register", async (req, res) => {
  const {
    fname,
    email,
    password,
    cpassword,
    district,
    state,
    aadhar,
    isCreatedByAdmin,
  } = req.body;
  if (
    !fname ||
    !email ||
    !password ||
    !cpassword ||
    !district ||
    !state ||
    !aadhar
  ) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const preuser = await userdb.findOne({ email: email });
    if (preuser) {
      res.status(422).json({ error: "This Email is Already Exist" });
    } else if (password !== cpassword) {
      res
        .status(422)
        .json({ error: "Password and Confirm Password Not Match" });
    } else {
      const finalUser = new userdb({
        fname,
        email,
        password,
        cpassword,
        district,
        state,
        aadhar,
        isCreatedByAdmin,
      });

      //here password hasing

      const storeData = await finalUser.save();
      // console.log(storeData);
      res.status(201).json({ status: 201, storeData });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});

//user Login

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to the application
 *     description: Login with email and password to get access to the application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: Password of the user
 *                 example: mypassword123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 result:
 *                   type: object
 *                   properties:
 *                     userValid:
 *                       type: object
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: Authentication token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password
 *       422:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Fill all the details
 */


router.post("/login", async (req, res) => {
  // console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const userValid = await userdb.findOne({ email: email });

    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);
      console.log(isMatch);
      if (!isMatch) {
        res.status(422).json({ error: "invalid details" });
      } else {
        // token generate
        const token = await userValid.generateAuthtoken();

        // cookiegenerate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });

        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block");
  }
});

//user valid

/**
 * @swagger
 * /validuser:
 *   get:
 *     summary: Get a validated user
 *     description: Returns a validated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                   example: 201
 *                 ValidUserOne:
 *                   type: object
 *                   description: Validated user data
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID
 *                       example: 61403224aee4aa6b4a4a174a
 *                     fname:
 *                       type: string
 *                       description: User's first name
 *                       example: John
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                       example: john@example.com
 *                     district:
 *                       type: string
 *                       description: User's district
 *                       example: ABC
 *                     state:
 *                       type: string
 *                       description: User's state
 *                       example: XYZ
 *                     aadhar:
 *                       type: string
 *                       description: User's Aadhar number
 *                       example: 123456789012
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */


router.get("/validuser", authenticate, async (req, res) => {
  try {
    const ValidUserOne = await userdb.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUserOne });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

//send email link for  reset password

/**
 * @swagger
 * /sendpasswordlink:
 *   post:
 *     summary: Sends an email to the user's email address with a password reset link
 *     tags: 
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       401:
 *         description: Invalid user or email not sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Invalid user or email not sent
 */

router.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;
  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await userdb.findOne({ email: email });
    //token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, keysecret, {
      expiresIn: "120s",
    });

    const setusertoken = await userdb.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: "arvind.ang2020@gmail.com",
        to: email,
        subject: "sending Email for password Reset",
        text: `This link is valid for 2 Minutes  http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent successfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});

//verify user for forgot password time

/**
 * @swagger
 * /forgotpassword/{id}/{token}:
 *   get:
 *     summary: Get user details for password reset
 *     description: Get the user details associated with the provided user id and token for resetting password
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User id
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for resetting password
 *     responses:
 *       '201':
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 validuser:
 *                   type: object
 *                   description: The user object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 611df2c0c1d7ad1d00751c6f
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     verifytoken:
 *                       type: string
 *                       example: 0dcbb797-8f7c-4d03-ae7c-6a8ad87db51f
 *       '401':
 *         description: User not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: user not exist
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */


router.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });
    const verifyToken = jwt.verify(token, keysecret);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

//change password

/**
 * @swagger
 * /{id}/{token}:
 *   post:
 *     summary: Reset user password
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: User token
 *       - in: body
 *         name: password
 *         description: New password to be set
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *     responses:
 *       '201':
 *         description: Password reset successful
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number
 *               example: 201
 *             setnewuserpass:
 *               type: object
 *               description: User object with updated password
 *       '401':
 *         description: User not found or invalid token
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number
 *               example: 401
 *             message:
 *               type: string
 *               example: User not exist
 *             error:
 *               type: object
 *               description: Error message (if any)
 */


router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });
    const verifyToken = jwt.verify(token, keysecret);

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);
      const setnewuserpass = await userdb.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );
      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// router.put("/update" ,authenticate ,async (req,res) => {
//   try {
//     console.log("dfjfjjf",req)
//     const user1 = await userdb.findById(req.userId);
//     const { fname,email,district,state } = req.body;
//     console.log(fname,email,district,state)
//     if (!fname||!email||!district||!state) {
//       res.status(422).json({ error: "fill all the details" });
//     } else {
//       user1.fname = fname;
//       user1.state = state;
//       user1.email = email;
//       user1.district = district;
     
//       const userSaved = await user1.save();
//       res.status(201).json({ status: 201, userSaved });
//     }
//   } catch (error) {
//     res.status(422).json(error);
//     console.log("catch block error");
//   }
  
// })

module.exports = router;
