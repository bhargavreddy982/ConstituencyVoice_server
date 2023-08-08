const authenticate = require("../middleware/authenticate");
const userdb = require("../models/userSchema");
const express = require("express");
const router = new express.Router();

const { json } = require("express");

/**
 * @swagger
 * /update:
 *   put:
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *             required:
 *               - fname
 *               - email
 *               - district
 *               - state
 *     responses:
 *       '201':
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 userSaved:
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '422':
 *         description: Validation error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "fill all the details"
 */


router.put("/update",authenticate,async(req,res) =>{
      try {
    // console.log("dfjfjjf",req)
    const user1 = await userdb.findById(req.userId);
    const { fname,email,district,state } = req.body;
    console.log(fname,email,district,state)
    if (!fname||!email||!district||!state) {
      res.status(422).json({ error: "fill all the details" });
    } else {
      user1.fname = fname;
      user1.state = state;
      user1.email = email;
      user1.district = district;
     
      const userSaved = await user1.save();
      res.status(201).json({ status: 201, userSaved });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
  
})

module.exports = router;