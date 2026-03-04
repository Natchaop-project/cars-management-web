"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { FirestoreCarDoc } from "@/src/types/carTypes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function TotalSaleChart() {
  const [totalSale, setTotalSale] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTotalSale = async () => {
      try {
        setIsLoading(true);
        setError("");

        const snapshot = await getDocs(collection(db, "cars"));

        const total = snapshot.docs.reduce((sum, item) => {
          const data = item.data() as FirestoreCarDoc;
          const isSold = data.forsale === false || data.Forsale === false;
          const price = data.salePrice ?? data.saleprice ?? 0;

          if (!isSold) {
            return sum;
          }

          return sum + (typeof price === "number" ? price : 0);
        }, 0);

        setTotalSale(total);
      } catch {
        setError("ไม่สามารถโหลดยอดขายสุทธิได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalSale();
  }, []);

  const chartData = useMemo(
    () => [
      {
        name: "ยอดขายสุทธิ",
        totalSale,
      },
    ],
    [totalSale],
  );

  if (isLoading) {
    return <p>กำลังโหลดยอดขายสุทธิ...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="w-full h-80 text-blue-500">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => value.toLocaleString()} allowDecimals={false} />
          <Tooltip formatter={(value) => Number(value).toLocaleString()} />
          <Bar dataKey="totalSale" fill="currentColor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TotalSaleChart;
