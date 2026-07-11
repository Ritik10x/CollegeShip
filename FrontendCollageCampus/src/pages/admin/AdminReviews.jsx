import { useEffect, useState } from "react";
import {
  FaCamera,
  FaEdit,
  FaPlus,
  FaStar,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../firebase";
import { FIELD_LIMITS } from "../../lib/fieldLimits";
const defaultForm = {
  name: "",
  institution: "",
  rating: 5,
  quote: "",
  avatarColor: "#002D62",
  avatarUrl: "",
  avatarStoragePath: "",
  showOnHome: false,
};
export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [formData, setFormData] = useState(defaultForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const showcaseCount = reviews.filter((review) => review.showOnHome).length;
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "showcaseReviews"),
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({ id: docSnap.id, ...docSnap.data() }),
        );
        setReviews(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setFeedbackMsg("Could not load reviews.");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);
  const resetForm = () => {
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setFormData(defaultForm);
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(false);
    setEditingId(null);
    setShowForm(false);
  };
  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setFormData({
      name: review.name || "",
      institution: review.institution || "",
      rating: Number(review.rating) || 5,
      quote: review.quote || "",
      avatarColor: review.avatarColor || "#002D62",
      avatarUrl: review.avatarUrl || "",
      avatarStoragePath: review.avatarStoragePath || "",
      showOnHome: Boolean(review.showOnHome),
    });
    setAvatarFile(null);
    setAvatarPreview(review.avatarUrl || "");
    setRemoveAvatar(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFeedbackMsg("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedbackMsg("Student photo must be 2 MB or smaller.");
      return;
    }
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setFeedbackMsg("");
  };
  const handleRemoveAvatar = () => {
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedbackMsg("");
    let uploadedStoragePath = "";
    try {
      const reviewRef = editingId
        ? doc(db, "showcaseReviews", editingId)
        : doc(collection(db, "showcaseReviews"));
      let avatarUrl = removeAvatar ? "" : formData.avatarUrl;
      let avatarStoragePath = removeAvatar ? "" : formData.avatarStoragePath;
      if (avatarFile) {
        const safeName = avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        uploadedStoragePath = `showcase-reviews/${reviewRef.id}/${Date.now()}-${safeName}`;
        const imageRef = storageRef(storage, uploadedStoragePath);
        const contentType = avatarFile.type || "image/jpeg";
        await uploadBytes(imageRef, avatarFile, { contentType });
        avatarUrl = await getDownloadURL(imageRef);
        avatarStoragePath = uploadedStoragePath;
      }
      const payload = {
        ...formData,
        avatarUrl,
        avatarStoragePath,
        rating: Math.max(1, Math.min(5, Number(formData.rating) || 5)),
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(reviewRef, payload);
        setFeedbackMsg("Review updated successfully.");
      } else {
        await setDoc(reviewRef, { ...payload, createdAt: serverTimestamp() });
        setFeedbackMsg("Review created successfully.");
      }
      const replacedOrRemoved =
        formData.avatarStoragePath &&
        formData.avatarStoragePath !== avatarStoragePath;
      if (replacedOrRemoved) {
        deleteObject(storageRef(storage, formData.avatarStoragePath)).catch(
          (error) => {
            console.warn(
              "Could not remove previous review photo:",
              error.message,
            );
          },
        );
      }
      resetForm();
    } catch (err) {
      console.error("Error saving review:", err);
      if (uploadedStoragePath) {
        deleteObject(storageRef(storage, uploadedStoragePath)).catch(() => {});
      }
      setFeedbackMsg("Error saving review: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (review) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(db, "showcaseReviews", review.id));
      if (review.avatarStoragePath) {
        deleteObject(storageRef(storage, review.avatarStoragePath)).catch(
          (error) => {
            console.warn("Could not remove review photo:", error.message);
          },
        );
      }
      setReviews((prev) => prev.filter((item) => item.id !== review.id));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Could not delete this review.");
    }
  };
  const handleToggleShowcase = async (review) => {
    const nextValue = !review.showOnHome;
    try {
      await updateDoc(doc(db, "showcaseReviews", review.id), {
        showOnHome: nextValue,
      });
      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id ? { ...item, showOnHome: nextValue } : item,
        ),
      );
    } catch (err) {
      console.error("Error updating review showcase:", err);
      alert("Could not update the review showcase setting.");
    }
  };
  return (
    <div className="p-1 md:p-4 max-w-7xl mx-auto">
      {" "}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D0D12] tracking-tight">
            Review Showcase
          </h1>{" "}
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Create and curate the student review carousel on the home page.
          </p>{" "}
          <p className="text-xs font-bold mt-2 text-primary">
            {" "}
            Home carousel: {showcaseCount} review
            {showcaseCount === 1 ? "" : "s"} enabled{" "}
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className={`w-full sm:w-auto px-5 py-3 rounded-card font-bold flex items-center justify-center gap-2 transition-all shadow-card ${showForm ? "bg-brand-bg hover:bg-gray-200 text-text-main" : "bg-primary text-white hover:bg-[#0D0D12] transition-colors duration-200"}`}
        >
          {" "}
          {showForm ? <FaTimes /> : <FaPlus />}{" "}
          {showForm ? "Close Form" : "Add Review"}{" "}
        </button>{" "}
      </div>{" "}
      {showForm && (
        <div className="glass-card p-6 md:p-8 mb-10">
          {" "}
          <h2 className="text-2xl font-bold text-gray-950 mb-6 pb-3 border-b border-border-subtle">
            {" "}
            {editingId ? "Edit Review" : "Create Review"}{" "}
          </h2>{" "}
          <form onSubmit={handleSubmit} className="space-y-6">
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {" "}
              <div>
                {" "}
                <label className="block text-xs font-bold text-text-muted mb-1">
                  Student Name *
                </label>{" "}
                <input
                  required
                  type="text"
                  maxLength={FIELD_LIMITS.studentName}
                  className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="e.g. Sneha Gupta"
                />{" "}
                <p className="mt-1 text-right text-xs text-text-muted">
                  {formData.name.length}/{FIELD_LIMITS.studentName}
                </p>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-xs font-bold text-text-muted mb-1">
                  College / Institution *
                </label>{" "}
                <input
                  required
                  type="text"
                  maxLength={FIELD_LIMITS.institution}
                  className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  value={formData.institution}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      institution: event.target.value,
                    })
                  }
                  placeholder="e.g. Delhi University"
                />{" "}
                <p className="mt-1 text-right text-xs text-text-muted">
                  {formData.institution.length}/{FIELD_LIMITS.institution}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-xs font-bold text-text-muted mb-2">
                Rating *
              </label>{" "}
              <div className="flex gap-2">
                {" "}
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className={`w-11 h-11 rounded-card flex items-center justify-center border transition-all ${formData.rating >= rating ? "bg-brand-bg border-primary text-primary" : "bg-white border-brand-border text-[#5B5B63]/60"}`}
                    aria-label={`${rating} star rating`}
                  >
                    {" "}
                    <FaStar />{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-xs font-bold text-text-muted mb-1">
                Review Text *
              </label>{" "}
              <textarea
                required
                rows="4"
                maxLength={FIELD_LIMITS.reviewQuote}
                className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                value={formData.quote}
                onChange={(event) =>
                  setFormData({ ...formData, quote: event.target.value })
                }
                placeholder="Write the student success review..."
              />{" "}
              <p className="mt-1 text-right text-xs text-text-muted">
                {formData.quote.length}/{FIELD_LIMITS.reviewQuote}
              </p>{" "}
            </div>{" "}
            <div className="rounded-card border border-brand-border bg-brand-bg/60 p-5">
              {" "}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {" "}
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Student avatar preview"
                    className="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover shadow-card"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white text-xl font-extrabold text-white shadow-card"
                    style={{
                      backgroundColor: formData.avatarColor || "#002D62",
                    }}
                  >
                    {" "}
                    {(formData.name || "Student")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}{" "}
                  </div>
                )}{" "}
                <div className="flex-1">
                  {" "}
                  <p className="text-sm font-extrabold text-[#0D0D12]">
                    Student Photo{" "}
                    <span className="font-medium text-text-muted">
                      (optional)
                    </span>
                  </p>{" "}
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    JPG, PNG, or WebP up to 2 MB. Without a photo, the student
                    initials and avatar color are used.
                  </p>{" "}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {" "}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-card bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0D0D12] transition-colors duration-200">
                      {" "}
                      <FaCamera />{" "}
                      {avatarPreview ? "Replace Photo" : "Upload Photo"}{" "}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="sr-only"
                      />{" "}
                    </label>{" "}
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="rounded-card bg-white px-4 py-2.5 text-xs font-bold text-[#B3261E] ring-1 ring-gray-200 transition hover:bg-[#B3261E]/10"
                      >
                        {" "}
                        Remove Photo{" "}
                      </button>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              {" "}
              <div>
                {" "}
                <label className="block text-xs font-bold text-text-muted mb-1">
                  Avatar Color
                </label>{" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <input
                    type="color"
                    className="w-14 h-11 rounded-card border border-brand-border bg-white p-1"
                    value={formData.avatarColor}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        avatarColor: event.target.value,
                      })
                    }
                  />{" "}
                  <span className="text-xs text-text-muted">
                    {formData.avatarColor}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <label className="flex items-center justify-between gap-4 rounded-card border border-brand-bg bg-background p-4">
                {" "}
                <div>
                  {" "}
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                    Show on Home
                  </p>{" "}
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Include this review in the carousel.
                  </p>{" "}
                </div>{" "}
                <input
                  type="checkbox"
                  checked={formData.showOnHome}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      showOnHome: event.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-primary"
                />{" "}
              </label>{" "}
            </div>{" "}
            <div className="flex gap-4 pt-2">
              {" "}
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white px-8 py-3 rounded-card font-bold transition-all hover:bg-[#0D0D12] transition-colors duration-200 disabled:opacity-60"
              >
                {" "}
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Publish Review"}{" "}
              </button>{" "}
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-brand-bg hover:bg-gray-200 text-text-main px-6 py-3 rounded-card font-bold transition"
                >
                  {" "}
                  Cancel Edit{" "}
                </button>
              )}{" "}
            </div>{" "}
          </form>{" "}
        </div>
      )}{" "}
      {feedbackMsg && (
        <p className="mb-6 text-sm font-bold text-primary">{feedbackMsg}</p>
      )}{" "}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          {" "}
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>{" "}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {" "}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="glass-card p-5 flex flex-col hover:-translate-y-1 transition-all duration-150 ease-in-out"
            >
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                {review.avatarUrl ? (
                  <img
                    src={review.avatarUrl}
                    alt={`${review.name || "Student"} profile`}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: review.avatarColor || "#002D62" }}
                  >
                    {" "}
                    {(review.name || "S")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}{" "}
                  </div>
                )}{" "}
                <div>
                  {" "}
                  <h3 className="font-extrabold text-[#0D0D12] leading-tight">
                    {review.name}
                  </h3>{" "}
                  <p className="text-xs text-primary font-semibold">
                    {review.institution}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex gap-1 mt-4 text-primary">
                {" "}
                {[
                  ...Array(
                    Math.max(1, Math.min(5, Number(review.rating) || 5)),
                  ),
                ].map((_, index) => (
                  <FaStar key={index} />
                ))}{" "}
              </div>{" "}
              <p className="text-sm text-text-muted mt-4 leading-relaxed line-clamp-4">
                "{review.quote}"
              </p>{" "}
              <div className="flex items-center justify-between gap-4 rounded-card border border-brand-bg bg-background p-3 my-5">
                {" "}
                <div>
                  {" "}
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                    Carousel
                  </p>{" "}
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Show on home page.
                  </p>{" "}
                </div>{" "}
                <button
                  type="button"
                  onClick={() => handleToggleShowcase(review)}
                  className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${review.showOnHome ? "bg-primary" : "bg-gray-300"}`}
                  aria-pressed={Boolean(review.showOnHome)}
                  aria-label={`Toggle ${review.name} review on home page`}
                >
                  {" "}
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${review.showOnHome ? "translate-x-8" : "translate-x-1"}`}
                  />{" "}
                </button>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                {" "}
                <button
                  onClick={() => handleStartEdit(review)}
                  className="bg-brand-bg border border-border-subtle text-text-main py-2.5 rounded-card font-bold text-xs hover:bg-brand-bg/80 transition-colors duration-200 transition-all flex items-center justify-center gap-1.5"
                >
                  {" "}
                  <FaEdit /> Edit{" "}
                </button>{" "}
                <button
                  onClick={() => handleDelete(review)}
                  className="bg-red-50 text-[#B3261E] py-2.5 rounded-card font-bold text-xs hover:bg-error transition-all flex items-center justify-center gap-1.5"
                >
                  {" "}
                  <FaTrashAlt /> Delete{" "}
                </button>{" "}
              </div>{" "}
            </div>
          ))}{" "}
          {reviews.length === 0 && (
            <p className="text-text-muted col-span-3 text-center py-20 font-medium glass-card">
              {" "}
              No showcase reviews found in Firestore.{" "}
            </p>
          )}{" "}
        </div>
      )}{" "}
    </div>
  );
}
