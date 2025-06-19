interface LoadingProps {
  message?: string;
  showOverlay?: boolean;
}

export default function Loading({ 
  message = "Đang tải dữ liệu...", 
  showOverlay = true 
}: LoadingProps) {
  return (
    <div className={`${showOverlay ? 'fixed inset-0' : 'w-full h-64'} z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}>
      {/* Backdrop overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
      )}
        {/* Loading content */}
      <div className="relative z-10 text-center animate-fade-in">
        {/* Book loader animation */}
        <div className="flex justify-center mb-8">
          <span className="loader"></span>
        </div>
        
        {/* Loading text with gradient */}
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text">
            {message}
          </h3>
  
        </div>
      </div>
    </div>
  );
}
