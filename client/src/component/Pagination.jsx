import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"; // Left and Right arrows

const Pagination = ({ totalPages, currentPage, setPage }) => {
  const maxVisibleButtons = 5; // Number of buttons to display

  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let end = Math.min(totalPages, start + maxVisibleButtons - 1);

    if (end - start < maxVisibleButtons - 1) {
      start = Math.max(1, end - maxVisibleButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  return (
    <div className="mt-6 flex justify-center items-center w-full max-w-3xl mx-auto">
      {/* Previous Button */}
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`${
          currentPage === 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-400"
        } py-2 px-4 mx-1 rounded-full transition duration-300`}
      >
        <FiChevronLeft size={20} />
      </button>

      {/* Page Number Buttons */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-blue-300"
          } py-2 px-4 mx-1 rounded-full transition duration-300`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`${
          currentPage === totalPages
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-400"
        } py-2 px-4 mx-1 rounded-full transition duration-300`}
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
