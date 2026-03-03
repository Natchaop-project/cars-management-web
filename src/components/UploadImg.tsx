"use client";

import { useRef, useState } from "react";
import Image from "next/image";

function UploadImg() {
  const [images, setImages] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };
  const handleRemoveAll = () => {
    setImages([]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col justify-center items-start gap-4 w-fit">
      {/* ซ่อน input จริง */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {/* ปุ่มที่เห็น */}
      <button
        onClick={handleClick}
        className="flex justify-start cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload Images
      </button>
      <div className="flex gap-4 relative">
        <div className="absolute right-0 text-white cursor-pointer" onClick={handleRemoveAll}>
          X
        </div>
        {images.map((file, index) => (
          <Image
            key={index}
            src={URL.createObjectURL(file)}
            alt="preview"
            width={100}
            height={100}
          />
        ))}
      </div>
    </div>
  );
}

export default UploadImg;
