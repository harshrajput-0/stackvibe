import mongoose from "mongoose";

const plannedFileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PlannedFile =
  mongoose.models.PlannedFile ||
  mongoose.model("PlannedFile", plannedFileSchema);

export default PlannedFile;
