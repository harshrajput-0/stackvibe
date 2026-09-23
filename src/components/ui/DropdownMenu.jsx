"use client";

import { useEffect, useRef } from "react";
import { Popover, usePopover } from "./Popover";
import { cn } from "@/lib/utils/cn";

const ITEM_SELECTOR = '[role="menuitem"]:not([disabled])';

function MenuList({ label, children }) {
  const listRef = useRef(null);

  // Move focus into the menu as soon as it opens.
  useEffect(() => {
    listRef.current?.querySelector(ITEM_SELECTOR)?.focus();
  }, []);

  function handleKeyDown(event) {
    const items = Array.from(listRef.current.querySelectorAll(ITEM_SELECTOR));
    if (!items.length) return;

    const current = items.indexOf(document.activeElement);
    let next;

    if (event.key === "ArrowDown") next = (current + 1) % items.length;
    else if (event.key === "ArrowUp")
      next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;

    event.preventDefault();
    items[next].focus();
  }

  return (
    <div ref={listRef} role="menu" aria-label={label} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

/**
 * DropdownMenu — an action menu built on <Popover>.
 *
 * Usage:
 * <DropdownMenu
 *   label="Project options"
 *   trigger={(props) => (
 *     <Button variant="overlay" size="iconSm" aria-label="Project options" {...props}>
 *       <MoreVertical size={16} />
 *     </Button>
 *   )}
 * >
 *   <DropdownItem icon={Pencil} onSelect={edit}>Edit details</DropdownItem>
 *   <DropdownSeparator />
 *   <DropdownItem icon={Trash2} tone="danger" onSelect={remove}>Delete</DropdownItem>
 * </DropdownMenu>
 */
export function DropdownMenu({
  trigger,
  label,
  children,
  align = "end",
  className,
}) {
  return (
    <Popover
      trigger={trigger}
      align={align}
      panelClassName={cn(
        "min-w-43 rounded-[10px] border border-(--gray-200) bg-white p-1.25 shadow-[0_8px_24px_rgba(0,0,0,0.14)]",
        className,
      )}
    >
      <MenuList label={label}>{children}</MenuList>
    </Popover>
  );
}

export function DropdownItem({
  icon: Icon,
  tone = "default",
  onSelect,
  className,
  children,
  ...props
}) {
  const { close } = usePopover();

  // globals.css resets button colours/backgrounds outside any layer, hence `!`.
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={() => {
        close(true);
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-center gap-2.25 rounded-md px-2.25 py-2 text-left text-[13px] font-medium",
        "focus-visible:-outline-offset-2!",
        tone === "danger"
          ? "text-[#dc2626]! hover:bg-[#fef2f2]! focus-visible:bg-[#fef2f2]!"
          : "text-(--gray-800)! hover:bg-(--gray-100)! focus-visible:bg-(--gray-100)!",
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="mx-0.5 my-1 h-px bg-(--gray-100)" />;
}
