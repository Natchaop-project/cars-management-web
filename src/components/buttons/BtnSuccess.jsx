import React from "react";

function BtnSuccess({ onClick, message, disabled = false }) {
  return (
    <button
      className={`text-white py-2 px-4 rounded duration-200 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 cursor-pointer hover:bg-blue-600"
      }`}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {message}
    </button>
  );
}

export default BtnSuccess;
