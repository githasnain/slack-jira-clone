export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slack-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
