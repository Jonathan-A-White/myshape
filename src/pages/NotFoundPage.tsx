import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center dark:bg-gray-900">
      <h1 className="mb-4 text-6xl font-bold text-primary dark:text-white">
        404
      </h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
        Page not found. The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light"
      >
        Go Home
      </Link>
    </div>
  );
}
