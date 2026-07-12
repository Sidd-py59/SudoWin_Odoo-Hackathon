import { ConfirmationDialog } from "@/components/transitops/confirmation-dialog";

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  onDelete: () => void;
};

export function DeleteDialog({ open, onOpenChange, entityLabel, onDelete }: DeleteDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${entityLabel}?`}
      description="This action cannot be undone."
      confirmLabel="Delete"
      onConfirm={onDelete}
    />
  );
}
