interface LoadMoreButtonProps {
  loading: boolean;
  onClick: () => void;
}

const LoadMoreButton = ({ loading, onClick }: LoadMoreButtonProps) => {
  return (
    <div className="mt-8 text-center">
      <button
        onClick={onClick}
        disabled={loading}
        className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '載入中...' : '載入更多'}
      </button>
    </div>
  );
};

export default LoadMoreButton; 