"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { CarRecord, FirestoreCarDoc, ModelChartItem } from "@/src/types/carTypes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ModelChart() {
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setIsLoading(true);
        setError("");

        const snapshot = await getDocs(collection(db, "cars"));
        const list = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreCarDoc;
          return {
            brand: data.brand?.trim() || "ไม่ระบุยี่ห้อ",
            model: data.model?.trim() || "ไม่ระบุรุ่น",
            year: data.year ?? null,
            salePrice: data.salePrice ?? data.saleprice ?? null,
          };
        });

        setCars(list);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลรุ่นรถได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  const brands = useMemo(
    () =>
      Array.from(new Set(cars.map((item) => item.brand))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [cars],
  );

  useEffect(() => {
    if (!selectedBrand && brands.length > 0) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  const modelChartData = useMemo<ModelChartItem[]>(() => {
    if (!selectedBrand) {
      return [];
    }

    const modelCount = new Map<string, number>();

    cars.forEach((item) => {
      if (item.brand !== selectedBrand) {
        return;
      }

      const yearLabel = item.year ?? "ไม่ระบุปี";
      const modelYearKey = `${item.model} (${yearLabel})`;
      const currentCount = modelCount.get(modelYearKey) || 0;
      modelCount.set(modelYearKey, currentCount + 1);
    });

    return Array.from(modelCount.entries())
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
  }, [cars, selectedBrand]);

  const modelYearPriceData = useMemo<
    Array<{
      label: string;
      model: string;
      year: number;
      salePrice: number;
    }>
  >(() => {
    if (!selectedBrand) {
      return [];
    }

    const separatedRows = cars
      .filter((item) => item.brand === selectedBrand && item.year !== null && item.salePrice !== null)
      .sort((a, b) => {
        if (a.year !== b.year) {
          return (a.year ?? 0) - (b.year ?? 0);
        }
        if (a.model !== b.model) {
          return a.model.localeCompare(b.model);
        }
        return (a.salePrice ?? 0) - (b.salePrice ?? 0);
      })
      .map((item, index) => ({
        label: `${item.model} (${item.year}) #${index + 1}`,
        model: item.model,
        year: item.year as number,
        salePrice: item.salePrice as number,
      }));

    if (separatedRows.length === 0) {
      return [
        {
          label: "ไม่มีข้อมูล",
          model: "ไม่มีรุ่น",
          year: new Date().getFullYear(),
          salePrice: 0,
        },
      ];
    }

    return separatedRows;
  }, [cars, selectedBrand]);

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

  const barChartData =
    modelChartData.length > 0
      ? modelChartData
      : [{ model: "ไม่มีข้อมูล", count: 0 }];

  if (isLoading) {
    return <p>กำลังโหลดกราฟรุ่นรถ...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (brands.length === 0) {
    return <p>ยังไม่มีข้อมูลรถสำหรับแสดงกราฟรุ่น</p>;
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="brand-filter">เลือกยี่ห้อ:</label>
        <select
          id="brand-filter"
          className="border p-2"
          value={selectedBrand}
          onChange={(event) => setSelectedBrand(event.target.value)}
        >
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full h-fit">
        <div className="w-full h-95">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 16, right: 24, left: 0, bottom: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="model"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {barChartData.map((item, index) => (
                  <Cell
                    key={`${item.model}-${index}`}
                    fill={getBarColor(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full h-95">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={modelYearPriceData}
              margin={{ top: 16, right: 24, left: 0, bottom: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis
                allowDecimals={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                formatter={(value) => Number(value).toLocaleString()}
                labelFormatter={(label) => String(label)}
              />
              <Line
                type="monotone"
                dataKey="salePrice"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ModelChart;
