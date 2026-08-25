import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, 5);
    }
    
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentPage === i
              ? "bg-[#1f1f1f] text-white border border-[#333]"
              : "bg-[#0d0d0d] text-gray-400 border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="mt-12 flex justify-center items-center gap-2 pb-8 lg:pb-0">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 flex items-center gap-1 rounded-lg text-sm font-semibold text-gray-400 bg-[#0d0d0d] border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev Page
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 flex items-center gap-1 rounded-lg text-sm font-semibold text-white bg-[#0d0d0d] border border-[#1a1a1a] hover:bg-[#1a1a1a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next Page
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
