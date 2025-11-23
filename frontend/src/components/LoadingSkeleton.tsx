export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex-shrink-0"></div>
          <div className="flex-1 max-w-md">
            <div className="bg-white/5 rounded-2xl rounded-bl-md p-4 space-y-2">
              <div className="h-4 bg-gray-600/50 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600/50 rounded w-1/2"></div>
            </div>
            <div className="flex items-center gap-2 mt-1 px-3">
              <div className="h-6 w-16 bg-gray-700/30 rounded"></div>
              <div className="h-6 w-16 bg-gray-700/30 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
