import React from 'react'

type BtnCancelProps = {
  message: string;
  onClick: () => void;
};

function BtnCancel({ message, onClick }: BtnCancelProps) {
  return (
    <button
      className="bg-red-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-red-600 duration-200"
      onClick={() => onClick()}
    >
      {message}
    </button>
  )
}

export default BtnCancel
