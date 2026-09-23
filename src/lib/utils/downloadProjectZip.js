import JSZip from "jszip";
import { saveAs } from "file-saver";
import { slugify } from "./slugify";
import {
  PREVIEW_ENTRY_CODE,
  DOWNLOAD_INDEX_HTML,
  DOWNLOAD_VITE_CONFIG,
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

  // Vite expects index.html at the project root (not in /public) and a
  // config that lets it parse JSX inside the .js files the AI generates.
  zip.file("index.html", DOWNLOAD_INDEX_HTML);
  zip.file("vite.config.js", DOWNLOAD_VITE_CONFIG);

  // Add default entry file if the AI didn't generate one
  if (!normalizedPaths.has("/index.js")) {
    zip.file("src/index.js", PREVIEW_ENTRY_CODE);
  }

  // The entry imports ./styles.css, so make sure it exists
  if (!normalizedPaths.has("/styles.css")) {
    zip.file("src/styles.css", "");
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

// Creates the package.json content for the downloaded React (Vite) project.
function buildPackageJson(projectName) {
  return JSON.stringify(
    {
      name: slugify(projectName),
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^19.2.8",
        "react-dom": "^19.2.8",
      },
      devDependencies: {
        "@vitejs/plugin-react": "^4.7.0",
        vite: "^6.4.0",
      },
    },
    null,
    2,
  );
}