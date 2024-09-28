const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  tgName: { type: String },
  _id: { type: String },
  ttId: { type: String },
  ttName: { type: String },
  cointrust: { type: Number },
  trustScore: { type: Number },
  tasks: [
    {
      id: { type: String, ref: "Task" },
      completed: { type: Boolean, default: "false" },
      deadline: { type: Date },
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
