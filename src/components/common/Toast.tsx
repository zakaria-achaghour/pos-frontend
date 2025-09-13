import { useEffect, useState } from "react";

export default function Toast({ message }: { message: string }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 2500);
    return () => clearTimeout(t);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 rounded bg-black px-3 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}

