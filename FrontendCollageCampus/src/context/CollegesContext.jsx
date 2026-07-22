import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const CollegesContext = createContext(null);

let cachedColleges = null;

export function CollegesProvider({ children }) {
  const [colleges, setColleges] = useState(() => cachedColleges || []);
  const [loading, setLoading] = useState(() => !cachedColleges);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const cacheKey = "collegeship_colleges_cache";
        const cacheTimeKey = "collegeship_colleges_cache_time";
        const now = new Date().getTime();
        const ttl = 30 * 60 * 1000; // 30 minutes
        
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);

        if (cachedData && cachedTime && now - parseInt(cachedTime, 10) < ttl) {
          const items = JSON.parse(cachedData);
          cachedColleges = items;
          setColleges(items);
          setLoading(false);
          setError(null);
          return;
        }

        const querySnapshot = await getDocs(collection(db, "colleges"));
        const items = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ _id: docSnap.id, ...docSnap.data() });
        });
        
        localStorage.setItem(cacheKey, JSON.stringify(items));
        localStorage.setItem(cacheTimeKey, now.toString());

        cachedColleges = items;
        setColleges(items);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("[CollegesContext] Error loading colleges:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const getCollegeById = useCallback(
    (id) => colleges.find((c) => c._id === id) || null,
    [colleges],
  );

  const featuredColleges = useMemo(
    () => colleges.filter((c) => c.showOnHome === true),
    [colleges],
  );

  const hasCache = colleges.length > 0;

  const value = useMemo(
    () => ({
      colleges,
      featuredColleges,
      loading: loading && !hasCache,
      error,
      getCollegeById,
      hasCache,
    }),
    [colleges, featuredColleges, loading, error, getCollegeById, hasCache],
  );

  return (
    <CollegesContext.Provider value={value}>
      {children}
    </CollegesContext.Provider>
  );
}

export function useColleges() {
  const ctx = useContext(CollegesContext);
  if (!ctx) {
    throw new Error("useColleges must be used within CollegesProvider");
  }
  return ctx;
}
