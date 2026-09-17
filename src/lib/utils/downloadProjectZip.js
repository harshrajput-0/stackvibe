import JSZip from "jszip";
import { saveAs } from "file-saver";
import { slugify } from "./slugify";
import {
  PREVIEW_ENTRY_CODE,
  PREVIEW_INDEX_HTML,
} from "@/lib/generation/previewTemplate";


// Creates a ZIP file containing all generated project files.
export async function downloadProjectZip(files = {}, projectName = "project") {
  // Get all file paths from the generated files object.
  const paths = Object.keys(files);
  if (paths.length === 0) return;

  const zip = new JSZip();
  const normalizedPaths = new Set(paths.map(normalizePath));

  // Generated files live under src/, matching the layout the live
  // preview already renders them in.
  paths.forEach((path) => {
    zip.file(`src${normalizePath(path)}`, files[path] ?? "");
  });

  // Add package.json to the downloaded project
  zip.file("package.json", buildPackageJson(projectName));

  // Add default ENTRY_CODE file if index.html is absent
  zip.file("public/index.html", PREVIEW_INDEX_HTML);
  if (!normalizedPaths.has("/index.js")) {
    zip.file("src/index.js", PREVIEW_ENTRY_CODE);
  }

  // Convert everything inside the ZIP into a browser Blob.
  const blob = await zip.generateAsync({ type: "blob" });

  // Start the download using the project name as the ZIP filename.
  saveAs(blob, `${slugify(projectName)}.zip`);
}

// Makes sure every file path starts with exactly one "/".
// 
function normalizePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

// Creates the package.json content for the downloaded React project.
function buildPackageJson(projectName) {
  return JSON.stringify(
    {
      name: slugify(projectName),
      version: "0.1.0",
      private: true,
      dependencies: {
        react: "^19.2.8",
        "react-dom": "^19.2.8",
        "react-scripts": "^5.0.1",
      },
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
        test: "react-scripts test",
        eject: "react-scripts eject",
      },
      eslintConfig: {
        extends: ["react-app"],
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version",
        ],
      },
    },
    null,
    2,
  );
}