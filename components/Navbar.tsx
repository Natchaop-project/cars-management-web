"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUserName = async (uid: string) => {
    try {
      const db = getFirestore();
      const usersCol = collection(db, "users");
      const usersSnapshot = await getDocs(usersCol);
      const usersList = usersSnapshot.docs.map(
        (doc) =>
          ({ id: doc.id, ...doc.data() }) as {
            id: string;
            name?: string;
            email?: string;
          },
      );
      const userData = usersList.find((user) => user.id === uid);
      console.log("Fetched users:", userName);
      if (userData) {
        setUserName(userData.name || userData.email?.split("@")[0] || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUserName("");
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }
      fetchUserName(user.uid);
      setIsLoggedIn(true);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch {
      alert("Logout ไม่สำเร็จ");
    }
  };

  const menu = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Cars", href: "/cars" },
    { name: "Add Car", href: "/add-car" },
  ];

  return (
    <div className="sticky top-0 z-50 flex w-full items-center justify-center h-16 bg-gray-100 text-xl px-6">
      <div className="flex justify-between w-1/2">
        {menu
          .filter((item) => (isLoggedIn ? item.name !== "Login" : true))
          .map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="hover:text-gray-500 duration-500"
            >
              {item.name}
            </a>
          ))}
      </div>

      <div className="ml-auto flex items-center gap-3 text-base font-medium">
        {authLoading ? <span>Loading...</span> : null}
        {userName ? <span>{`สวัสดี, ${userName}`}</span> : null}
        {!authLoading && isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 duration-200 cursor-pointer"
          >
            Logout
          </button>
        ) : !authLoading ? (
          <div>
            <button
              onClick={() => router.push("/login")}
              className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 duration-200 cursor-pointer"
            >
              Login
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Navbar;
