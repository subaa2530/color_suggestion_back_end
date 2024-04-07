import mongoose from "./index.js";
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {},
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30000,
  },
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;
