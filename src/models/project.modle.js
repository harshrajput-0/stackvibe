import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    files: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Project =
  mongoose.models.Project ||
  mongoose.model("Project", projectSchema);

export default Project;