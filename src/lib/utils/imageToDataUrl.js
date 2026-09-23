// Turns an uploaded image file into a small JPEG data URL, centre-cropped to
// the given aspect ratio. Keeps stored thumbnails to a few tens of KB.

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 400; // 16:10, matching project cards

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be read as an image."));
    };
    image.src = url;
  });
}

export async function imageToDataUrl(
  file,
  { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, quality = 0.82 } = {},
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a PNG or JPG image.");
  }

  const image = await loadImage(file);

  // "cover" crop: scale until the target box is filled, then centre.
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff"; // flatten transparent PNGs onto white
  context.fillRect(0, 0, width, height);
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  return canvas.toDataURL("image/jpeg", quality);
}
