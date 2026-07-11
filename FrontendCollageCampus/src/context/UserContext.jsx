import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { openAuthModal } from "../components/AuthModal";
const UserContext = createContext();
const getCollegeId = (college) => college?._id || college?.id || college?.collegeId;

function normalizeFavoriteCollege(college) {
  const id = getCollegeId(college);
  if (!id) {
    throw new Error("College id is required to save favorites");
  }
  return {
    _id: id,
    name: college.name || "",
    type: college.type || "",
    location: college.location || {},
    thumbnail: college.thumbnail || "",
    courses: Array.isArray(college.courses) ? college.courses : [],
    averageReview: college.averageReview ?? null,
  };
}
export function UserProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCollegeForApply, setSelectedCollegeForApply] =
    useState(null); /* Auth State */
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  /* Keep track of favorites unsubscriber */ const unsubscribeFavoritesRef =
    useRef(null);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[UserContext] Auth state changed:", firebaseUser?.uid);
      /* Clean up previous favorites listener */ if (
        unsubscribeFavoritesRef.current
      ) {
        unsubscribeFavoritesRef.current();
        unsubscribeFavoritesRef.current = null;
      }
      setUser(firebaseUser);
      if (firebaseUser && firebaseUser.email) {
        try {
          /* Check admin status */
          const adminDocRef = doc(db, "admins", firebaseUser.email);
          const adminDocSnap = await getDoc(adminDocRef);
          setIsAdmin(
            adminDocSnap.exists() && adminDocSnap.data()?.role === "admin",
          );
          /* Real-time listener for favorites */ const userDocRef = doc(
            db,
            "userFavorites",
            firebaseUser.uid,
          );
          const unsubscribeFavorites = onSnapshot(
            userDocRef,
            (docSnap) => {
              console.log("[UserContext] Favorites snapshot received");
              if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("[UserContext] Favorites data:", data?.favorites);
                setFavorites(
                  Array.isArray(data?.favorites) ? data.favorites : [],
                );
              } else {
                console.log(
                  "[UserContext] No favorites document, setting empty array",
                );
                setFavorites([]);
              }
              setIsAuthLoading(false);
            },
            (error) => {
              console.error("[UserContext] Favorites listener error:", error);
              setFavorites([]);
              setIsAuthLoading(false);
            },
          );
          unsubscribeFavoritesRef.current = unsubscribeFavorites;
        } catch (error) {
          console.error("[UserContext] Error setting up listeners:", error);
          setIsAdmin(false);
          setFavorites([]);
          setIsAuthLoading(false);
        }
      } else {
        console.log("[UserContext] User not logged in");
        setIsAdmin(false);
        setFavorites([]);
        setIsAuthLoading(false);
      }
    });
    return () => {
      console.log("[UserContext] Cleanup: unsubscribing all listeners");
      if (unsubscribeFavoritesRef.current) {
        unsubscribeFavoritesRef.current();
      }
      unsubscribeAuth();
    };
  }, []);
  const toggleFavorite = async (college) => {
    if (!user) {
      showToast("Please login to add favorites", "info");
      return;
    }
    try {
      const collegeId = getCollegeId(college);
      if (!collegeId) {
        showToast("Unable to save this college", "error");
        return;
      }
      const isFav = favorites.some((c) => getCollegeId(c) === collegeId);
      let newFavorites;
      if (isFav) {
        newFavorites = favorites.filter((c) => getCollegeId(c) !== collegeId);
        showToast("COLLEGE REMOVED FROM FAVORITES", "info");
      } else {
        newFavorites = [...favorites, normalizeFavoriteCollege(college)];
        showToast("COLLEGE ADDED TO FAVORITES", "success");
      }
      console.log(
        "[UserContext] Saving favorites:",
        newFavorites,
      ); /* Save to Firestore */
      await saveFavoritesToFirestore(newFavorites);
    } catch (error) {
      console.error("[UserContext] Error toggling favorite:", error);
      showToast("Error updating favorites", "error");
    }
  };
  const saveFavoritesToFirestore = async (favoritesToSave) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "userFavorites", user.uid);
      await setDoc(
        userDocRef,
        { favorites: favoritesToSave, updatedAt: new Date(), userId: user.uid },
        { merge: true },
      );
      console.log(
        "[UserContext] Favorites saved to Firestore:",
        favoritesToSave.length,
        "items",
      );
    } catch (error) {
      console.error(
        "[UserContext] Error saving favorites to Firestore:",
        error,
      );
      throw error;
    }
  };
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const openApplyModal = (college) => {
    if (!auth.currentUser) {
      showToast("Please login or sign up to apply", "error");
      openAuthModal("signup");
      return;
    }
    setSelectedCollegeForApply(college);
    setIsApplyModalOpen(true);
  };
  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedCollegeForApply(null);
  };
  return (
    <UserContext.Provider
      value={{
        favorites,
        toggleFavorite,
        toast,
        isApplyModalOpen,
        openApplyModal,
        closeApplyModal,
        selectedCollegeForApply,
        showToast,
        user,
        isAdmin,
        isAuthLoading,
      }}
    >
      {" "}
      {children} {/* Global Toast Notification */}{" "}
      {toast && (
        <div className="fixed top-8 right-8 z-[2000] animate-in slide-in-from-right-8 duration-300">
          {" "}
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-card shadow-glass-lg border glass-strong ${toast.type === "success" ? "border-l-4 border-l-success text-success" : toast.type === "error" ? "border-l-4 border-l-error text-error" : "border-l-4 border-l-primary text-primary"}`}
          >
            {" "}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-success/10" : toast.type === "error" ? "bg-error/10" : "bg-brand-bg"}`}
            >
              {" "}
              {toast.type === "success" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}{" "}
            </div>{" "}
            <span className="font-extrabold text-[11px] uppercase tracking-[0.2em]">
              {toast.message}
            </span>{" "}
            <div className="absolute bottom-0 left-0 h-1 bg-accent rounded-full animate-progress-shrink"></div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </UserContext.Provider>
  );
}
export const useUser = () => useContext(UserContext);
