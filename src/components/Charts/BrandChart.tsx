"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { BrandChartItem, FirestoreCarDoc } from "@/src/types/carTypes";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function BrandChart() {
  const [chartData, setChartData] = useState<BrandChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrandCounts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const snapshot = await getDocs(collection(db, "cars"));
        const countByBrand = new Map<string, number>();

        snapshot.docs.forEach((item) => {
          const data = item.data() as FirestoreCarDoc;
          const brand = data.brand?.trim() || "ไม่ระบุยี่ห้อ";
          const currentCount = countByBrand.get(brand) || 0;
          countByBrand.set(brand, currentCount + 1);
        });

        const result = Array.from(countByBrand.entries())
          .map(([brand, count]) => ({ brand, count }))
          .sort((a, b) => a.brand.localeCompare(b.brand));

        setChartData(result);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลกราฟได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandCounts();
  }, []);

  if (isLoading) {
    return <p>กำลังโหลดกราฟ...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (chartData.length === 0) {
    return <p>ยังไม่มีข้อมูลรถสำหรับแสดงกราฟ</p>;
  }

  const coolTonePalette = [
    "#0ea5e9",
    "#38bdf8",
    "#0284c7",
    "#06b6d4",
    "#14b8a6",
    "#0d9488",
    "#3b82f6",
    "#2563eb",
    "#6366f1",
    "#8b5cf6",
  ];

  const getBarColor = (index: number) =>
    coolTonePalette[index % coolTonePalette.length];

  return (
    <div className="w-full h-95">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="brand" interval={0} angle={-25} textAnchor="end" height={70} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {chartData.map((item, index) => (
              <Cell key={`${item.brand}-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BrandChart;
