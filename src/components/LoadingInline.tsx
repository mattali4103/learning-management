interface LoadingInlineProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function LoadingInline({ 
  size = 'md', 
  message,
  className = ""
}: LoadingInlineProps) {
  const sizeClasses = {
    sm: 'scale-50',
    md: 'scale-75', 
    lg: 'scale-100'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  return (
    <div className={`flex flex-col items-center justify-center py-8 space-y-4 ${className}`}>
      {/* Mini book loader */}
      <div className="animate-fade-in">
        <span className={`loader ${sizeClasses[size]}`}></span>
      </div>
      
      {/* Optional message */}
      {message && (
        <p className={`${textSizeClasses[size]} text-gray-600 animate-pulse`}>
          {message}
        </p>
      )}
      
      {/* Simple dots */}
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
