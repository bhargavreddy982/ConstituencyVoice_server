const mongoose = require("mongoose");
const DB =
  "mongodb+srv://navaneethsaipatti:rsyr3107@cluster0.s8vqsab.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection start to DB"))
  .catch((error) => console.log(error.messsage));
