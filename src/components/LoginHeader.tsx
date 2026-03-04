"use client";

import { auth } from "@/src/lib/firebase";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import BtnSuccess from "./buttons/BtnSuccess";

export default function LoginHeader() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("User:", user);
      console.log("Name:", user.displayName);
      console.log("Email:", user.email);
      console.log("Photo:", user.photoURL);

    } catch (error) {
      console.error("Login error:", error);
    }
  };
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
      <BtnSuccess onClick={handleLogin} message="Login" />
      <div className="w-full text-end">
        <a
          href="/register"
          className="text-[12px] hover:underline hover:text-blue-500"
        >
          register
        </a>
      </div>
      <BtnSuccess onClick={handleGoogleLogin} message="Login with Google" />
    </div>
  );
}
