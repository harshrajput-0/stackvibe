"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

function ConfirmBody({
  warning,
  confirmWord,
  confirmLabel,
  cancelLabel,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  const [typed, setTyped] = useState("");
  const ready = typed.trim().toLowerCase() === confirmWord.toLowerCase();

  function handleSubmit(event) {
    event.preventDefault();
    if (ready && !loading) onConfirm();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {warning && (
        <div className="mt-4.5 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3.5 py-3 text-[13px] leading-normal text-[#991b1b]">
          {warning}
        </div>
      )}

      <Input
        label={
          <>
            Type <strong>{confirmWord}</strong> to confirm
          </>
        }
        id="confirm-word"
        placeholder={confirmWord}
        autoComplete="off"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        error={error}
        disabled={loading}
        data-autofocus
        className="mt-5 mb-0"
      />

      <div className="mt-6 flex gap-2.5">
        <Button variant="secondary" block onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button type="submit" variant="danger" block disabled={!ready} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * ConfirmModal — type-to-confirm dialog for destructive actions.
 * Built on <Modal>, so it shares its look, focus handling and Esc/backdrop
 * behaviour with every other dialog.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  confirmWord = "delete",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  error,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      dismissible={!loading}
    >
      <ConfirmBody
        warning={warning}
        confirmWord={confirmWord}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        loading={loading}
        error={error}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </Modal>
  );
}
