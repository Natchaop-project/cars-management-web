"use client";

import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function LoginHeader() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMessage("");
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login success");
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential"
        ) {
          setErrorMessage("รหัสผ่านไม่ถูกต้อง");
          return;
        }

        setErrorMessage("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
        return;
      }

      setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-[300px] ">
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

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600 duration-200"
        onClick={handleLogin}
      >
        Login
      </button>
      <div className="w-full text-end">
        <a
          href="/register"
          className="text-[12px] hover:underline hover:text-blue-500"
        >
          register
        </a>
      </div>
    </div>
  );
}
