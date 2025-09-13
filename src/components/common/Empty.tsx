export default function Empty({ message = "No data" }: { message?: string }) {
  return (
    <div className="rounded border border-dashed p-8 text-center text-gray-500">
      {message}
    </div>
  );
}

