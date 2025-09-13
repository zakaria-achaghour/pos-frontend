export default function Tables() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Tables</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded border p-6 text-center">Table {i + 1}</div>
        ))}
      </div>
    </div>
  );
}

