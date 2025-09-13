export default function Spinner() {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      <span>Loading...</span>
    </div>
  );
}

