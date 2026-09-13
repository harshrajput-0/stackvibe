import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Project",
    },

    description: {
      type: String,
      default: "",
    },

    messages: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: [],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    files: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    version: {
      type: Number,
      default: 0,
    },

    published: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "generating", "revising", "failed", "completed"],
      default: "pending",
    },

    filesPlanned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlannedFile",
      default: [],
    },

    filesGenerated: {
      type: [String],
      default: [],
    },

    currentFile: {
      type: String,
      defautl: null,
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
