const mongoose = require("mongoose");
const validator = require("validator");

const mesageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdb",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdb",
      required: true,
    },
    message: {
      title: {
        type: String,
        required: true,
      },
      body: {
        type: String,
        required: true,
      },
    },
    attachments: [
      {
        type: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", mesageSchema);

module.exports = Message;
