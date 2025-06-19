interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function LoadingButton({ 
  loading, 
  children, 
  onClick,
  disabled = false,
  className = "",
  variant = 'primary'
}: LoadingButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${getVariantClasses()}
        ${loading || disabled ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
    >      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg animate-fade-in">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
      
      {/* Button content */}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
}
