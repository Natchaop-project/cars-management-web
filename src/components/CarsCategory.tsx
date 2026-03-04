"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { CarItem, FirestoreCarDoc, FirestoreUserDoc } from "@/src/types/carTypes";
import BtnSuccess from "./buttons/BtnSuccess";

const formatCreatedAt = (createdAt?: { toDate?: () => Date }) => {
  if (!createdAt?.toDate) {
    return "-";
  }

  return createdAt.toDate().toLocaleString("th-TH");
};

function CarsCategory() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [hiddenCars, setHiddenCars] = useState<CarItem[]>([]);
  const [showHiddenCars, setShowHiddenCars] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const carsQuery = query(
        collection(db, "cars"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocsFromServer(carsQuery);

      const allDocs = snapshot.docs;

      const uniqueUserIds = Array.from(
        new Set(
          allDocs
            .map((item) => {
              const data = item.data() as FirestoreCarDoc;
              return data.userId;
            })
            .filter((userId): userId is string => Boolean(userId)),
        ),
      );

      const ownerNameMap = new Map<string, string>();

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const userSnapshot = await getDoc(doc(db, "users", userId));
          const userData = userSnapshot.data() as FirestoreUserDoc | undefined;
          ownerNameMap.set(userId, userData?.name || "ไม่ทราบชื่อ");
        }),
      );

      const mapDocToCar = (item: (typeof allDocs)[number]): CarItem => {
        const data = item.data() as FirestoreCarDoc;

        return {
          id: item.id,
          importId: data.importId ?? item.id,
          brand: data.brand || "-",
          model: data.model || "-",
          year: data.year || 0,
          salePrice: data.salePrice ?? data.saleprice ?? null,
          forsale: data.forsale ?? data.Forsale ?? true,
          userId: data.userId ?? null,
          ownerName: data.userId ? ownerNameMap.get(data.userId) || "ไม่ทราบชื่อ" : "ไม่ทราบชื่อ",
          createdAtText: formatCreatedAt(data.createdAt),
        };
      };

      const visibleCarList = allDocs
        .filter((item) => {
          const data = item.data() as FirestoreCarDoc;
          return data.isHidden !== true;
        })
        .map(mapDocToCar);

      const hiddenCarList = allDocs
        .filter((item) => {
          const data = item.data() as FirestoreCarDoc;
          return data.isHidden === true;
        })
        .map(mapDocToCar);

      setCars(visibleCarList);
      setHiddenCars(hiddenCarList);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลรถได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleHide = async (carId: string) => {
    const isConfirmed = confirm("คุณแน่ใจหรือไม่ว่าต้องการซ่อนข้อมูลรถนี้?");

    if (!isConfirmed) {
      return;
    }

    try {
      setError("");
      await updateDoc(doc(db, "cars", carId), {
        isHidden: true,
        hiddenAt: serverTimestamp(),
      });
      await fetchCars();
      alert("ซ่อนข้อมูลรถเรียบร้อย");
    } catch {
      setError("ไม่สามารถซ่อนข้อมูลรถได้");
    }
  };

  const handleRestore = async (carId: string) => {
    try {
      setError("");
      await updateDoc(doc(db, "cars", carId), {
        isHidden: false,
        restoredAt: serverTimestamp(),
      });
      await fetchCars();
      alert("กู้คืนข้อมูลรถเรียบร้อย");
    } catch {
      setError("ไม่สามารถกู้คืนข้อมูลรถได้");
    }
  };

  const handleSell = async (carId: string) => {
    const isConfirmed = confirm("คุณแน่ใจหรือไม่ว่าต้องการทำเครื่องหมายว่าขายรถคันนี้?");
    if (!isConfirmed) {
      return;
    }

    try {
      setError("");
      await updateDoc(doc(db, "cars", carId), {
        forsale: false,
        soldAt: serverTimestamp(),
      });
      await fetchCars();
      alert("อัปเดตสถานะขายเรียบร้อย");
    } catch {
      setError("ไม่สามารถอัปเดตสถานะขายได้");
    }
  };
  
  return (
    <div className="w-full max-w-[600px]">
      {isLoading && <p>กำลังโหลดข้อมูลรถ...</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && cars.length === 0 && <p>ยังไม่มีข้อมูลรถ</p>}
      <div>
        <BtnSuccess onClick={fetchCars} message="รีเฟรชข้อมูลรถ"/>
        <button
          className="bg-red-500 cursor-pointer p-2 text-white rounded-sm"
          onClick={() => setShowHiddenCars(true)}
        >
          ที่ลบไปแล้ว
        </button>
      </div>
      {!isLoading && !error && cars.length > 0 && (
          <ul className="grid grid-cols-3 gap-4">
            {cars.map((car) => (
              <li key={car.id} className="border p-3 rounded relative">
                <div className="absolute top-2 right-2 cursor-pointer"  onClick={() => handleHide(car.id)}>
                  X
                </div>
                <div className="font-bold text">{car.brand}</div>
                <div>ID รถ: {car.importId}</div>
                <div>{car.model}</div>
                <div>{car.year}</div>
                <div>ราคาขาย: {car.salePrice !== null ? car.salePrice.toLocaleString() : "-"}</div>
                <div>วันที่สร้าง: {car.createdAtText}</div>
                <div>ผู้กรอก: {car.ownerName}</div>
                <BtnSuccess
                  message={car.forsale ? "ขาย" : "ขายแล้ว"}
                  onClick={() => handleSell(car.id)}
                  disabled={!car.forsale}
                />
              </li>
            ))}
          </ul>

      )}

      {showHiddenCars && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl rounded bg-white p-4 max-h-[90vh] overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">รายการที่ลบ/ซ่อนไปแล้ว</h3>
              <button
                className="cursor-pointer rounded border px-3 py-1"
                onClick={() => setShowHiddenCars(false)}
              >
                ปิด
              </button>
            </div>

            {hiddenCars.length === 0 ? (
              <p>ยังไม่มีรายการที่ลบ/ซ่อน</p>
            ) : (
              <ul className="grid grid-cols-3 gap-4">
                {hiddenCars.map((car) => (
                  <li key={car.id} className="border p-3 rounded opacity-75">
                    <div className="font-bold text">{car.brand}</div>
                    <div>ID รถ: {car.importId}</div>
                    <div>{car.model}</div>
                    <div>{car.year}</div>
                    <div>ราคาขาย: {car.salePrice !== null ? car.salePrice.toLocaleString() : "-"}</div>
                    <div>วันที่สร้าง: {car.createdAtText}</div>
                    <div>ผู้กรอก: {car.ownerName}</div>
                    <button
                      className="mt-2 cursor-pointer rounded bg-blue-500 px-3 py-1 text-white"
                      onClick={() => handleRestore(car.id)}
                    >
                      กู้คืน
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarsCategory;
