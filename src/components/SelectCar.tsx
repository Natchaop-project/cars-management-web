import axios from "axios";
import { useEffect, useState } from "react";
import {
  VehicleMakesResponse,
  VehicleModelsResponse,
} from "@/src/types/vehicleApiTypes";
import BtnSuccess from "./buttons/BtnSuccess";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";

const currentYear = new Date().getFullYear();
const startYear = 1980;

const normalizeModelName = (name: string) =>
  name.toUpperCase().replace(/[^A-Z0-9]/g, "");

const thailandAvailableMakes = [
  "AION",
  "AUDI",
  "BMW",
  "BYD",
  "CHANGAN",
  "CHEVROLET",
  "DEEPAL",
  "FERRARI",
  "FORD",
  "GAC",
  "GEELY",
  "GREAT WALL",
  "HAVAL",
  "HONDA",
  "HYUNDAI",
  "ISUZU",
  "JAGUAR",
  "JEEP",
  "KIA",
  "LAMBORGHINI",
  "LAND ROVER",
  "LEXUS",
  "LOTUS",
  "MASERATI",
  "MAZDA",
  "MERCEDES BENZ",
  "MG",
  "MINI",
  "MITSUBISHI",
  "NETA",
  "NISSAN",
  "OMODA",
  "ORA",
  "PEUGEOT",
  "PORSCHE",
  "SUBARU",
  "SUZUKI",
  "TESLA",
  "TOYOTA",
  "VINFAST",
  "VOLVO",
  "WULING",
  "XPENG",
];

const normalizeMakeName = (name: string) =>
  name.toUpperCase().replace(/[^A-Z0-9]/g, "");
const thailandAvailableMakeSet = new Set(
  thailandAvailableMakes.map(normalizeMakeName),
);

const buildBrandImportId = (brandName: string, sequence: number) => {
  const brandKey = normalizeMakeName(brandName);
  const sequenceText = String(sequence).padStart(6, "0");
  return `${brandKey}${sequenceText}`;
};

function SelectCar() {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<string[]>([]);
  const [carYears, setCarYears] = useState<number[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const [modelsError, setModelsError] = useState("");
  const [yearsError, setYearsError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [salePrice, setSalePrice] = useState("");

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setIsLoadingBrands(true);
        setBrandsError("");

        const { data } = await axios.get<VehicleMakesResponse>(
          "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json",
        );

        const makes = data.Results.map((item) => item.Make_Name)
          .filter((make) =>
            thailandAvailableMakeSet.has(normalizeMakeName(make)),
          )
          .sort((a, b) => a.localeCompare(b));
        setCarBrands(makes);
      } catch {
        setBrandsError("ไม่สามารถโหลดข้อมูลยี่ห้อรถได้");
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchMakes();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedBrand) {
        setCarModels([]);
        setSelectedModel("");
        setCarYears([]);
        setSelectedYear("");
        setModelsError("");
        return;
      }

      try {
        setIsLoadingModels(true);
        setModelsError("");
        setSelectedModel("");
        setCarYears([]);
        setSelectedYear("");
        setYearsError("");

        const { data } = await axios.get<VehicleModelsResponse>(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(selectedBrand)}?format=json`,
        );

        const models = Array.from(
          new Set(data.Results.map((item) => item.Model_Name)),
        ).sort((a, b) => a.localeCompare(b));
        setCarModels(models);
      } catch {
        setCarModels([]);
        setModelsError("ไม่สามารถโหลดข้อมูลรุ่นรถได้");
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [selectedBrand]);

  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedBrand || !selectedModel) {
        setCarYears([]);
        setSelectedYear("");
        setYearsError("");
        return;
      }

      try {
        setIsLoadingYears(true);
        setYearsError("");
        setSelectedYear("");

        const matchedYears = new Set<number>();
        const modelKey = normalizeModelName(selectedModel);
        const yearList = Array.from(
          { length: currentYear - startYear + 1 },
          (_, index) => startYear + index,
        );

        await Promise.all(
          yearList.map(async (year) => {
            const { data } = await axios.get<VehicleModelsResponse>(
              `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(selectedBrand)}/modelyear/${year}?format=json`,
            );

            const hasModelInYear = data.Results.some(
              (item) => normalizeModelName(item.Model_Name) === modelKey,
            );
            if (hasModelInYear) {
              matchedYears.add(year);
            }
          }),
        );

        const sortedYears = Array.from(matchedYears).sort((a, b) => a - b);
        setCarYears(sortedYears);
      } catch {
        setCarYears([]);
        setYearsError("ไม่สามารถโหลดข้อมูลปีของรุ่นรถได้");
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchYears();
  }, [selectedBrand, selectedModel]);

  const handleConfirm = async () => {
    if (isSaving) {
      return;
    }

    if (!selectedBrand || !selectedModel || !selectedYear || !salePrice) {
      alert("กรุณาเลือกยี่ห้อ รุ่น ปีของรถ และกรอกราคาขายให้ครบถ้วน");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");

      const numericSalePrice = Number(salePrice) || 0;

      const counterDocId = normalizeMakeName(selectedBrand);
      const counterRef = doc(db, "carImportCounters", counterDocId);

      const nextSequence = await runTransaction(db, async (transaction) => {
        const counterSnapshot = await transaction.get(counterRef);
        const lastSequence = counterSnapshot.exists()
          ? ((counterSnapshot.data() as { lastSequence?: number }).lastSequence ?? -1)
          : -1;

        const newSequence = lastSequence + 1;

        transaction.set(
          counterRef,
          {
            brand: selectedBrand,
            lastSequence: newSequence,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        return newSequence;
      });

      const importId = buildBrandImportId(selectedBrand, nextSequence);

      await addDoc(collection(db, "cars"), {
        brand: selectedBrand,
        model: selectedModel,
        year: Number(selectedYear),
        salePrice: numericSalePrice,
        forsale: true,
        importId,
        importSequence: nextSequence,
        userId: auth.currentUser?.uid ?? null,
        createdAt: serverTimestamp(),
      });

      alert(
        `บันทึกข้อมูลรถเรียบร้อย: ${selectedBrand} ${selectedModel} ปี ${selectedYear} (ID: ${importId})`,
      );
    } catch {
      setSaveError("ไม่สามารถบันทึกข้อมูลรถได้");
    } finally {
      setSelectedBrand("");
      setSelectedModel("");
      setSelectedYear("");
      setSalePrice("");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center m-6 gap-4 w-full">
      <div className="flex flex-col gap-4 w-full max-w-[400px]">
        <label htmlFor="car-brand">ยี่ห้อรถ</label>
        <select
          id="car-brand"
          name="car-brand"
          value={selectedBrand}
          className="border p-2"
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setSelectedModel("");
            setSelectedYear("");
          }}
          disabled={isLoadingBrands || !!brandsError}
        >
          <option value="" disabled>
            {isLoadingBrands ? "กำลังโหลดข้อมูลยี่ห้อรถ..." : "เลือกยี่ห้อรถ"}
          </option>
          {carBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <label htmlFor="car-model">รุ่นรถ</label>
        <select
          id="car-model"
          name="car-model"
          value={selectedModel}
          className="border p-2"
          onChange={(e) => {
            setSelectedModel(e.target.value);
            setSelectedYear("");
          }}
          disabled={
            !selectedBrand ||
            isLoadingModels ||
            carModels.length === 0 ||
            !!modelsError
          }
        >
          <option value="" disabled>
            {!selectedBrand
              ? "กรุณาเลือกยี่ห้อก่อน"
              : isLoadingModels
                ? "กำลังโหลดรุ่นรถ..."
                : carModels.length > 0
                  ? "เลือกรุ่นรถ"
                  : "ไม่พบข้อมูลรุ่นรถ"}
          </option>
          {carModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <label htmlFor="car-year">ปี/เจเนอเรชันของรุ่น</label>
        <select
          id="car-year"
          name="car-year"
          value={selectedYear}
          className="border p-2"
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={
            !selectedModel ||
            isLoadingYears ||
            carYears.length === 0 ||
            !!yearsError
          }
        >
          <option value="" disabled>
            {!selectedModel
              ? "กรุณาเลือกรุ่นก่อน"
              : isLoadingYears
                ? "กำลังโหลดปีของรุ่น..."
                : carYears.length > 0
                  ? "เลือกปีของรุ่น"
                  : "ไม่พบข้อมูลปีของรุ่น"}
          </option>
          {carYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <label>ราคาขาย</label>
        <input
          type="number"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="border p-2"
        />
      </div>
      <BtnSuccess
        message={isSaving ? "กำลังบันทึก..." : "ยืนยัน"}
        onClick={handleConfirm}
      />

      {brandsError && <p>{brandsError}</p>}
      {modelsError && <p>{modelsError}</p>}
      {yearsError && <p>{yearsError}</p>}
      {saveError && <p>{saveError}</p>}
    </div>
  );
}

export default SelectCar;
