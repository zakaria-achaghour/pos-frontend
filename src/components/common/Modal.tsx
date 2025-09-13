import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ open: boolean; onClose: () => void; title?: string }>;

export default function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-sm">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

