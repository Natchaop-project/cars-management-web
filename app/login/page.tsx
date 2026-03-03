"use client";
import LoginHeader from "@/components/LoginHeader";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


function Login() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/");
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checkingAuth) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-[300px] w-full items-center mt-5">
      <h1>Login</h1>
      <LoginHeader />
    </div>
  );
}

export default Login;
