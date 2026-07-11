import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FaTrash, FaStar, FaBuilding } from "react-icons/fa";
export default function AdminCollegeReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "collegeReviews"));
      const items = [];
      snapshot.forEach((docSnap) =>
        items.push({ id: docSnap.id, ...docSnap.data() }),
      );
      items.sort(
        (a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
      );
      setReviews(items);
    } catch (error) {
      console.error("Error fetching college reviews:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);
  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteDoc(doc(db, "collegeReviews", reviewId));
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review");
      }
    }
  };
  if (loading) {
    return (
      <div className="text-text-muted flex justify-center items-center h-64">
        Loading reviews...
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {" "}
      <div className="flex justify-between items-center glass-card p-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl font-bold text-[#0D0D12]">College Reviews</h1>{" "}
          <p className="text-text-muted text-sm mt-1">
            Manage user reviews for all colleges.
          </p>{" "}
        </div>{" "}
        <div className="bg-brand-bg text-primary px-4 py-2 rounded-card font-bold border border-brand-bg">
          {" "}
          {reviews.length} Total Reviews{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {" "}
        {reviews.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-text-muted">
            {" "}
            No college reviews found.{" "}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="glass-card overflow-hidden flex flex-col"
            >
              {" "}
              <div className="p-4 border-b border-border-subtle bg-brand-bg flex justify-between items-start">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {" "}
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.userName?.charAt(0) || "U"
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-[#0D0D12] text-sm line-clamp-1">
                      {review.userName || "Unknown User"}
                    </h3>{" "}
                    <p className="text-xs text-text-muted">
                      {review.userEmail}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-[#B3261E] hover:bg-[#B3261E]/10 p-2 rounded-lg transition-colors"
                  title="Delete Review"
                >
                  {" "}
                  <FaTrash size={14} />{" "}
                </button>{" "}
              </div>{" "}
              <div className="p-5 flex-1 flex flex-col">
                {" "}
                <div className="flex justify-between items-center mb-3">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <div className="flex text-accent text-xs">
                      {" "}
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={
                            star <= review.rating
                              ? "text-accent"
                              : "text-gray-200"
                          }
                        />
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {" "}
                    {review.createdAt
                      ? review.createdAt.toDate().toLocaleDateString()
                      : "N/A"}{" "}
                  </span>{" "}
                </div>{" "}
                <p className="text-text-muted text-sm leading-relaxed line-clamp-4 flex-1">
                  {" "}
                  "{review.reviewText}"{" "}
                </p>{" "}
                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2">
                  {" "}
                  <FaBuilding
                    className="text-text-muted shrink-0"
                    size={14}
                  />{" "}
                  <span className="text-xs font-bold text-primary truncate">
                    {" "}
                    {review.collegeName || "Unknown College"}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ))
        )}{" "}
      </div>{" "}
    </div>
  );
}
