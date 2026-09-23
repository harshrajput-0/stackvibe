"use client";

import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
} from "@/components/ui";

/**
 * The "⋮" options menu for a project. Reusable anywhere a project is shown
 * (dashboard cards today; the builder top bar could use it too).
 */
export function ProjectMenu({ project, onEdit, onDelete, className }) {
  const label = `Options for ${project.name}`;

  return (
    <div className={className}>
      <DropdownMenu
        label={label}
        trigger={(triggerProps) => (
          <Button
            variant="overlay"
            size="iconSm"
            aria-label={label}
            {...triggerProps}
          >
            <EllipsisVertical size={16} />
          </Button>
        )}
      >
        <DropdownItem icon={Pencil} onSelect={() => onEdit(project)}>
          Edit details
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem
          icon={Trash2}
          tone="danger"
          onSelect={() => onDelete(project)}
        >
          Delete project
        </DropdownItem>
      </DropdownMenu>
    </div>
  );
}
