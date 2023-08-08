const jwt = require("jsonwebtoken");
const userdb = require("../models/userSchema");
const keysecret = "yaswanthreddymaguluri";

const authenticate = async (req, res, next) => {
  try {
    // console.log(req);
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);

    const verifytoken = jwt.verify(token, keysecret);
    console.log(verifytoken);

    const rootUser = await userdb.findById({ _id: verifytoken._id });
    console.log(rootUser);

    if (!rootUser) {
      throw new Error("user not found");
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;
    console.log("katuka ");
    console.log("ponovbeo")
    next();
  } catch (error) {
    res
      .status(401)
      .json({ status: 401, message: "Unauthorized no token provide" });
  }
};

// const authenticate = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       // console.log(req);
//       token = req.headers.authorization.split(" ")[1];
//       console.log("tok" + token);

//       const decoded = jwt.verify(token, keysecret);

//       req.user = await userdb.findById(decoded.id).select("-password");
//       console.log("room id is " + req.body.RoomId);
//       console.log(req.user);

//       next();
//     } catch (error) {
//       req.error = "Not authorized, token failed";
//       console.log(req.error);
//       // res.redirect("http://localhost:3000/api/user/login");
//       next();
//       // throw new Error("Not authorized, token failed");
//     }
//   }

//   /* if (!token) {
//     req.error = "Not authorized, no token";
//     //res.redirect("/error");
//     next();
//     //throw new Error("Not authorized, no token");
//   }*/
// };

module.exports = authenticate;
