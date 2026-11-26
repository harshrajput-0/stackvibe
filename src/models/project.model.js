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
      enum: ["pending", "generating", "revising", "limit", "failed", "completed"],
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

    // Files that failed after all retries and fell back to placeholders.
    // Used to show incomplete builds and allow per-file retries.
    filesFailed: {
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

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    ownerHandle: {
      type: String,
      trim: true,
      default: null,
    },
    publicSlug: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    thumbnail: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// A slug must be unique per owner (not across the whole app).
projectSchema.index({ owner: 1, slug: 1 }, { unique: true });
// Fast lookup for public pages: /<ownerHandle>/<slug>
projectSchema.index({ ownerHandle: 1, slug: 1 });

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project; 