interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onLoad: () => void;
}

const LoadMoreButton = ({ loading, hasMore, onLoad }: LoadMoreButtonProps) => {
  if (!hasMore) {
    return <p className="text-gray-500">🚫 沒有更多個案</p>;
  }

  return (
    <button
      onClick={onLoad}
      disabled={loading}
      className={`bg-blue-500 text-white rounded-md px-6 py-2 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2 min-w-[160px]`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          <span>載入中...</span>
        </>
      ) : (
        <span>查看更多個案</span>
      )}
    </button>
  );
};

export default LoadMoreButton; 