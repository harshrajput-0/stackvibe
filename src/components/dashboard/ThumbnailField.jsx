"use client";

import { useRef, useState } from "react";
import { Button, FieldLabel, FormError } from "@/components/ui";
import { imageToDataUrl } from "@/lib/utils/imageToDataUrl";
import { ProjectThumb } from "./ProjectThumb";

/**
 * Thumbnail picker: live preview plus "Upload image" / "Reset to default".
 * `value` is an image data URL, or null for the default placeholder.
 */
export function ThumbnailField({ value, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again
    if (!file) return;

    setError("");
    setProcessing(true);
    try {
      onChange(await imageToDataUrl(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <FieldLabel>Thumbnail</FieldLabel>
      <ProjectThumb src={value} className="rounded-md border" />
      <div className="mt-2.5 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={processing}
          disabled={disabled}
        >
          Upload image
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setError("");
            onChange(null);
          }}
          disabled={disabled || !value}
        >
          Reset to default
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error ? (
        <FormError className="mt-1.5">{error}</FormError>
      ) : (
        <p className="mt-1.5 text-xs text-(--gray-500)">
          PNG or JPG, shown at a 16:10 ratio.
        </p>
      )}
    </div>
  );
}
