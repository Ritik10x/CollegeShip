import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const CollegesContext = createContext(null);

let cachedColleges = null;

export function CollegesProvider({ children }) {
  const [colleges, setColleges] = useState(() => cachedColleges || []);
  const [loading, setLoading] = useState(() => !cachedColleges);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "colleges"),
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ _id: docSnap.id, ...docSnap.data() });
        });
        cachedColleges = items;
        setColleges(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[CollegesContext] Error loading colleges:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
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
