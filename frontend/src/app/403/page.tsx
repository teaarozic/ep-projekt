export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center text-gray-700">
      <h1 className="mb-2 text-4xl font-bold text-red-600">403 – Forbidden</h1>
      <p className="max-w-md text-gray-500">
        You don’t have permission to access this page. Please contact your
        administrator if you think this is a mistake.
      </p>
    </div>
  );
}
