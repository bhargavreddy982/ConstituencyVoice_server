const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdb",
      required: true,
    },
    // only have admin id if its staus is sent
    // if status is draft then admin id is null

    // status whether it is draft or sent
    status: {
      type: String,
      default: "draft",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdb",
      },
    ],
  },
  { timestamps: true }
);
complaintSchema.index({ resolved: 1 });
// createIndex({ title: "text", description: "text" });
complaintSchema.index({ title: 'text', description: 'text', user: 1 });
//create index for querying based on user 
// complaintSchema.index({ user: 1 });
// create index 

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
