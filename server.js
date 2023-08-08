const express = require("express");




const app = express();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require("./db/conn");
const router = require("./routes/router");
const complaintRouter = require("./routes/complaintRouter");
const profileRouter = require("./routes/profilepicrouter");
const cors = require("cors");
const cookiParser = require("cookie-parser");
const file_upload = require("express-fileupload");
const userdb = require("./models/userSchema");
const body_parser = require("body-parser");
const multer = require("multer");
const authenticate = require("./middleware/authenticate");
const port = 5001;

const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const userUpdateRouter = require("./routes/userUpdateRouter")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// app.get("/", (req,res)=>{
//     res.status(201).json("server created");
// })
app.use(express.json());
app.use(cookiParser());
app.use(cors());

// app.use(body_parser.json());
// app.use(body_parser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

var accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan(":method :url :response-time ms", { stream: accessLogStream }));


app.use("/lg", router);
app.use("/complaints", complaintRouter);

// http://localhost:5001/admins/${userContext.logindata.user.district}
app.get("/admins/:district", async (req, res) => {
  try {
    const admins = await userdb.find({
      isCreatedByAdmin: true,
      district: req.params.district,
    });
    console.log(admins);
    res.status(201).json(admins);
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});

app.use("/upload",profileRouter)
app.use("/user",userUpdateRouter);


//swagger 

let swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API for JSONPlaceholder",
    version: "1.0.0",
    description:
      "This is a REST API application made with Express. It retrieves data from JSONPlaceholder.",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
    contact: {
      name: "JSONPlaceholder",
      url: "https://jsonplaceholder.typicode.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


module.exports = app;