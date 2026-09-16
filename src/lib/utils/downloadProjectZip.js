import JSZip from "jszip";
import { saveAs } from "file-saver";
import { slugify } from "./slugify";

// Build a .zip from the project's { path: content } file map and save it
// to the user's device. Nested paths (e.g. "src/app/page.js") are
// preserved as folders inside the archive.
export async function downloadProjectZip(files = {}, projectName = "project") {
  const paths = Object.keys(files);
  if (paths.length === 0) return;

  const zip = new JSZip();
  paths.forEach((path) => {
    zip.file(path, files[path] ?? "");
  });

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${slugify(projectName)}.zip`);
}