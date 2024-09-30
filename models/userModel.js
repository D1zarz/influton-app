const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  tgName: { type: String },
  _id: { type: String },
  ttId: { type: String },
  ttName: { type: String },
  cointrust: { type: Number },
  trustScore: { type: Number },
  language_code: { type: String },
  followerCount: { type: Number },
  heartCount: { type: Number },
  videoCount: { type: Number },
  register_date: { type: Date, default: Date.now },
  last_login: {
    type: Date,
  },
  tasks: [
    {
      id: { type: String, ref: "Task" },
      completed: { type: Boolean, default: "false" },
      deadline: { type: Date },
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
