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
      type: [
        {
          role: { type: String, enum: ["user", "assistant"], required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    owner: {
      type: String,
      required: true,
      index: true,
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
      type: [
        {
          path: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      default: [],
    },

    filesGenerated: {
      type: [String],
      default: [],
    },

    currentFile: {
      type: String,
      default: null,
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