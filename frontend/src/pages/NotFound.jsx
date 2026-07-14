import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found.</p>
      <Link
        to="/dashboard"
        className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;