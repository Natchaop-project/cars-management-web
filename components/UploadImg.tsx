"use client";

import { useState } from "react";
import Image from "next/image";

function UploadImg() {
  const [images, setImages] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };
  return (
    <div className="flex flex-col justify-center items-center gap-4 w-[300px] ">
      <input type="file" accept="image/*" multiple onChange={handleChange} />{" "}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
