"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterHeader() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!email.includes("@")) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมากกว่า 6 ตัวอักษร");
      return;
    }

    try {
      // 1️⃣ สร้าง user ใน Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      // 2️⃣ สร้างข้อมูลใน Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      alert("Register สำเร็จ");

      // 3️⃣ redirect
      router.push("/login");
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้งานแล้ว");
        return;
      } else {
        setError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-[300px]">
      <input
        type="text"
        placeholder="Name"
        className="border p-2"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 duration-200"
        onClick={handleRegister}
      >
        Register
      </button>
    </div>
  );
}
