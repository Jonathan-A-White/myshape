import { useEffect } from "react";
import { Link, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    console.error("Route error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center dark:bg-gray-900">
      <h1 className="mb-4 text-3xl font-bold text-primary dark:text-white">
        Something went wrong
      </h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800"
        >
          Reload
        </button>
        <Link
          to="/"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
