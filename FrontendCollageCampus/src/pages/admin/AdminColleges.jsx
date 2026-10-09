import React, { Suspense, useEffect, useState } from "react";
import {
  deleteObject,
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  FaTrashAlt,
  FaPlus,
  FaEdit,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaImage,
  FaTimes,
  FaStar,
  FaPhone,
} from "react-icons/fa";
import { db, storage } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { FIELD_LIMITS } from "../../lib/fieldLimits";
import { getStoragePathFromUrl } from "../../lib/collegeMaps";
import {
  extractIndiaMobileNumber,
  formatIndiaPhoneStorage,
} from "../../lib/indiaPhone";

const LocationMapPicker = React.lazy(
  () => import("../../components/LocationMapPicker"),
);

function MapPickerFallback() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-card border border-brand-border bg-brand-bg text-sm text-text-muted">
      Loading map picker...
    </div>
  );
}
const MAX_GALLERY_PHOTOS = FIELD_LIMITS.galleryPhotos;
const MAX_BROCHURE_BYTES = 4 * 1024 * 1024;
function FieldCounter({ current, max, hint = "" }) {
  return (
    <p className="mt-1 text-right text-[10px] text-text-muted">
      {" "}
      {current}/{max}
      {hint ? ` — ${hint}` : ""}{" "}
    </p>
  );
}

function sanitizeFeeInput(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, FIELD_LIMITS.fee);
}

function sanitizeFeeForEdit(value) {
  if (value === "NA" || !value) return "";
  return sanitizeFeeInput(value);
}
const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7,
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); /* Fallback to original */
            }
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
export default function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [pendingGallery, setPendingGallery] = useState([]);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  /* Track if form was attempted */ /* Main container ref for scrolling */ const topRef =
    React.useRef(null);
  /* Refs for scrolling to invalid fields */ const nameRef = React.useRef(null);
  const cityRef = React.useRef(null);
  const displayAddressRef = React.useRef(null);
  const mapAddressRef = React.useRef(null);
  const coursesRef = React.useRef(null);
  /* New College / Edit College Form State */ const [formData, setFormData] =
    useState({
      name: "",
      logo: "",
      thumbnail: "",
      type: "Private",
      establishedDate: "",
      description: "",
      studentCount: "",
      averageReview: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      contactPhoneAlt: "",
      socialInstagram: "",
      socialFacebook: "",
      socialX: "",
      socialYoutube: "",
      location: {
        city: "",
        displayAddress: "",
        mapAddress: "",
        lat: null,
        lng: null,
      },
      photos: [],
      accreditation: "",
      /* Comma-separated in form, array in DB */ features: "",
      /* Comma-separated in form, array in DB */ facilities: "",
      /* Comma-separated in form, array in DB */ rankings: "",
      /* Comma-separated in form, array in DB */ highlights: "",
      /* Comma-separated in form, array in DB (e.g. 100+ Acres Campus) */       brochure:
        "",
      studyModes: { online: true, offline: true },
      courses: [] /* Array of structured course objects */,
    });
  /* Temporary course form state */ const [tempCourse, setTempCourse] =
    useState({
      name: "",
      specialization: "",
      duration: "4 Years",
      mode: "Full Time",
      tuitionFees: "",
      termFees: "",
      termStructure: "Yearly",
      registration: "",
      total: "",
      seats: "",
    });
  const fetchColleges = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "colleges"));
      const cols = [];
      querySnapshot.forEach((doc) => {
        cols.push({ _id: doc.id, ...doc.data() });
      });
      setColleges(cols);
      /* Check query parameters to see if edit requested */ const params =
        new URLSearchParams(window.location.search);
      const editId = params.get("edit");
      if (editId) {
        const collegeToEdit = cols.find((c) => c._id === editId);
        if (collegeToEdit) {
          handleStartEdit(collegeToEdit);
        }
      }
    } catch (err) {
      console.error("Error fetching colleges:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchColleges();
  }, []);
  const resetGalleryState = () => {
    pendingGallery.forEach((item) => {
      if (item.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setPendingGallery([]);
    setRemovedPhotoUrls([]);
  };
  const handleStartEdit = (college) => {
    resetGalleryState();
    setEditingId(college._id);
    /* Filter out invalid blob: URLs from the stored data */ const safeLogoUrl =
      college.logo && !college.logo.startsWith("blob:") ? college.logo : "";
    const safeThumbnailUrl =
      college.thumbnail && !college.thumbnail.startsWith("blob:")
        ? college.thumbnail
        : "";
    setLogoPreview(safeLogoUrl);
    setThumbnailPreview(safeThumbnailUrl);
    setFormData({
      name: college.name || "",
      logo: safeLogoUrl,
      thumbnail: safeThumbnailUrl,
      type: college.type || "Private",
      establishedDate: college.establishedDate
        ? new Date(college.establishedDate).toISOString().substring(0, 10)
        : "",
      description: college.description || "",
      studentCount: college.studentCount || "",
      averageReview: college.averageReview || "",
      website: college.website || "",
      contactEmail: college.contactEmail || "",
      contactPhone: extractIndiaMobileNumber(college.contactPhone || ""),
      contactPhoneAlt: extractIndiaMobileNumber(college.contactPhoneAlt || ""),
      socialInstagram: college.socialInstagram || "",
      socialFacebook: college.socialFacebook || "",
      socialX: college.socialX || "",
      socialYoutube: college.socialYoutube || "",
      location: {
        city: college.location?.city || "",
        displayAddress:
          college.location?.displayAddress ||
          college.location?.formattedAddress ||
          "",
        mapAddress:
          college.location?.mapAddress ||
          college.location?.formattedAddress ||
          "",
        lat:
          college.location?.lat != null &&
          !(
            Number(college.location.lat) === 0 &&
            Number(college.location.lng) === 0
          )
            ? college.location.lat
            : null,
        lng:
          college.location?.lng != null &&
          !(
            Number(college.location.lat) === 0 &&
            Number(college.location.lng) === 0
          )
            ? college.location.lng
            : null,
      },
      photos: Array.isArray(college.photos)
        ? college.photos.filter(Boolean)
        : [],
      accreditation: Array.isArray(college.accreditation)
        ? college.accreditation.join(", ")
        : college.accreditation || "",
      features: Array.isArray(college.features)
        ? college.features.join(", ")
        : college.features || "",
      facilities: Array.isArray(college.facilities)
        ? college.facilities.join(", ")
        : college.facilities || "",
      rankings: Array.isArray(college.rankings)
        ? college.rankings.join(", ")
        : college.rankings || "",
      highlights: Array.isArray(college.highlights)
        ? college.highlights.join(", ")
        : college.highlights || "",
      brochure: college.brochure || "",
      studyModes: {
        online: college.studyModes?.online !== false,
        offline: college.studyModes?.offline !== false,
      },
      courses: Array.isArray(college.courses) ? college.courses : [],
    });
    setShowForm(true);
    /* Give React a tick to render the form before scrolling */ setTimeout(
      () => {
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      100,
    );
  };
  const handleCancelEdit = () => {
    resetGalleryState();
    setSubmitted(false);
    setEditingId(null);
    setLogoPreview("");
    setThumbnailPreview("");
    setUploadProgress(0);
    setFormData({
      name: "",
      logo: "",
      thumbnail: "",
      type: "Private",
      establishedDate: "",
      description: "",
      studentCount: "",
      averageReview: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      contactPhoneAlt: "",
      location: {
        city: "",
        displayAddress: "",
        mapAddress: "",
        lat: null,
        lng: null,
      },
      photos: [],
      accreditation: "",
      features: "",
      facilities: "",
      rankings: "",
      highlights: "",
      brochure: "",
      studyModes: { online: true, offline: true },
      courses: [],
    });
    setShowForm(false);
    /* Remove edit parameter from URL */ const url = new URL(
      window.location.href,
    );
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url.toString());
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college?"))
      return;
    try {
      await deleteDoc(doc(db, "colleges", id));
      setColleges(colleges.filter((c) => c._id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error("Error deleting college:", err);
      alert("Error deleting college");
    }
  };
  const featuredCount = colleges.filter((college) => college.showOnHome).length;
  const handleToggleHomeShowcase = async (college) => {
    const nextValue = !college.showOnHome;
    try {
      await updateDoc(doc(db, "colleges", college._id), {
        showOnHome: nextValue,
      });
      setColleges((prev) =>
        prev.map((item) =>
          item._id === college._id ? { ...item, showOnHome: nextValue } : item,
        ),
      );
    } catch (err) {
      console.error("Error updating home showcase:", err);
      alert("Could not update the home page showcase setting.");
    }
  };
  const addCourseToTable = () => {
    if (!tempCourse.name.trim()) {
      alert("Please enter a course name");
      return;
    }
    if (tempCourse.name.length > FIELD_LIMITS.courseName) {
      alert(
        `Course name must be ${FIELD_LIMITS.courseName} characters or fewer.`,
      );
      return;
    }
    if (
      tempCourse.seats !== "" &&
      (Number(tempCourse.seats) < 0 ||
        Number(tempCourse.seats) > FIELD_LIMITS.maxSeats)
    ) {
      alert(
        `Seats must be between 0 and ${FIELD_LIMITS.maxSeats.toLocaleString()}.`,
      );
      return;
    }
    /* Calculate total fees */ const parseFee = (val) => {
      if (!val) return 0;
      const num = Number(val.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? 0 : num;
    };
    let totalVal =
      parseFee(tempCourse.tuitionFees) +
      parseFee(tempCourse.termFees) +
      parseFee(tempCourse.registration);
    let finalTotal =
      totalVal > 0 ? `₹${totalVal.toLocaleString("en-IN")}` : "NA";
    /* If user explicitly provided a total string and we did not calculate one, or they override it: */ if (
      tempCourse.total &&
      tempCourse.total.trim() !== ""
    ) {
      finalTotal = tempCourse.total;
    }
    const processedCourse = {
      ...tempCourse,
      specialization: tempCourse.specialization.trim() || "NA",
      tuitionFees: tempCourse.tuitionFees.trim() || "NA",
      termFees: tempCourse.termFees.trim() || "NA",
      registration: tempCourse.registration.trim() || "NA",
      total: finalTotal,
      seats: tempCourse.seats.trim() || "NA",
    };
    setFormData({
      ...formData,
      courses: [...formData.courses, processedCourse],
    });
    setTempCourse({
      name: "",
      specialization: "",
      duration: "4 Years",
      mode: "Full Time",
      tuitionFees: "",
      termFees: "",
      termStructure: "Yearly",
      registration: "",
      total: "",
      seats: "",
    });
  };
  const removeCourseFromTable = (indexToRemove) => {
    setFormData({
      ...formData,
      courses: formData.courses.filter((_, idx) => idx !== indexToRemove),
    });
  };
  const editCourseFromTable = (indexToEdit) => {
    const courseToEdit = formData.courses[indexToEdit];
    /* Replace NA with empty strings so inputs are not populated with NA */ const sanitizeForEdit =
      (val) => (val === "NA" ? "" : val);
    setTempCourse({
      name: sanitizeForEdit(courseToEdit.name) || "",
      specialization: sanitizeForEdit(courseToEdit.specialization) || "",
      duration: sanitizeForEdit(courseToEdit.duration) || "4 Years",
      mode: sanitizeForEdit(courseToEdit.mode) || "Full Time",
      tuitionFees: sanitizeFeeForEdit(courseToEdit.tuitionFees) || "",
      termFees: sanitizeFeeForEdit(courseToEdit.termFees) || "",
      termStructure: sanitizeForEdit(courseToEdit.termStructure) || "Yearly",
      registration: sanitizeFeeForEdit(courseToEdit.registration) || "",
      total: sanitizeFeeForEdit(courseToEdit.total) || "",
      seats: sanitizeForEdit(courseToEdit.seats) || "",
    });
    setFormData({
      ...formData,
      courses: formData.courses.filter((_, idx) => idx !== indexToEdit),
    });
    if (coursesRef.current) {
      coursesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  const totalGalleryCount =
    (formData.photos?.length || 0) + pendingGallery.length;
  const updateContactPhoneField = (field, value) => {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, FIELD_LIMITS.footerPhone);
    setFormData((prev) => ({ ...prev, [field]: digitsOnly }));
  };
  const handleBrochureUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Please upload a PDF file only.");
      return;
    }
    if (file.size > MAX_BROCHURE_BYTES) {
      alert("Brochure PDF must be under 4 MB.");
      return;
    }
    setFormData((prev) => ({ ...prev, brochureFile: file }));
  };
  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const remainingSlots = MAX_GALLERY_PHOTOS - totalGalleryCount;
    if (remainingSlots <= 0) {
      alert(`You can upload up to ${MAX_GALLERY_PHOTOS} gallery photos.`);
      return;
    }
    const acceptedFiles = files.slice(0, remainingSlots);
    const nextPending = [];
    for (const file of acceptedFiles) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image file.`);
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} must be 2 MB or smaller.`);
        continue;
      }
      nextPending.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }
    if (nextPending.length) {
      setPendingGallery((prev) => [...prev, ...nextPending]);
    }
  };
  const handleRemoveSavedGalleryPhoto = (photoUrl) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((url) => url !== photoUrl),
    }));
    setRemovedPhotoUrls((prev) => [...prev, photoUrl]);
  };
  const handleRemovePendingGalleryPhoto = (photoId) => {
    setPendingGallery((prev) => {
      const target = prev.find((item) => item.id === photoId);
      if (target?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((item) => item.id !== photoId);
    });
  };
  const handleCommaListChange = (field, value) => {
    const prevValue = formData[field] || "";
    /* Always allow deletion */ if (value.length < prevValue.length) {
      setFormData({ ...formData, [field]: value });
      return;
    }
    /* Auto-truncate logic to handle oversized pasting smoothly */ let items =
      value.split(",");
    /* 1. Enforce max 30 items */ if (items.length > 30) {
      items = items.slice(0, 30);
    }
    /* 2. Enforce max 20 chars per item */ items = items.map((item) => {
      if (item.length > 20) {
        return item.slice(0, 20);
      }
      return item;
    });
    const newValue = items.join(",");
    setFormData({ ...formData, [field]: newValue });
  };
  const uploadFile = (file, path) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageReference = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(storageReference, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setUploadProgress(progress);
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };
  const handleSubmit = async (e) => {
    setUploadProgress(0);
    e.preventDefault();
    setSubmitted(true);
    /* Client-side validation with scroll to first error */ const errors = [];
    if (!formData.name.trim())
      errors.push({ ref: nameRef, label: "College Name" });
    if (!formData.location.city.trim())
      errors.push({ ref: cityRef, label: "City" });
    if (!formData.location.displayAddress.trim())
      errors.push({ ref: displayAddressRef, label: "Public Address" });
    if (!formData.location.mapAddress.trim())
      errors.push({ ref: mapAddressRef, label: "Map Search Address" });
    if (formData.courses.length === 0)
      errors.push({ ref: coursesRef, label: "Courses (at least 1 required)" });
    if (
      formData.studyModes?.online === false &&
      formData.studyModes?.offline === false
    ) {
      setFeedbackMsg("Select at least one study mode for this college.");
      return;
    }
    if (errors.length > 0) {
      /* Scroll to the topmost invalid field */ const firstError = errors[0];
      if (firstError.ref?.current) {
        firstError.ref.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstError.ref.current.focus();
      }
      setFeedbackMsg(
        `Please fill in required fields: ${errors.map((e) => e.label).join(", ")}`,
      );
      return;
    }
    setFeedbackMsg("");
    setSubmitting(true);
    try {
      const parseCommaSeparated = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return val
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
      };
      const checkLength = (arr, limit, fieldName) => {
        for (const item of arr) {
          if (item.length > limit) {
            throw new Error(
              `In ${fieldName}, the item "${item.substring(0, 20)}..." exceeds the ${limit} character limit.`,
            );
          }
        }
      };
      const checkItemCount = (arr, limit, fieldName) => {
        if (arr.length > limit) {
          throw new Error(
            `${fieldName} cannot exceed ${limit} items. You currently have ${arr.length} items.`,
          );
        }
      };
      const formattedData = {
        ...formData,
        studentCount: formData.studentCount ? Number(formData.studentCount) : 0,
        averageReview: formData.averageReview
          ? Number(formData.averageReview)
          : 0,
        contactPhone: formData.contactPhone
          ? formatIndiaPhoneStorage(formData.contactPhone)
          : "",
        contactPhoneAlt: formData.contactPhoneAlt
          ? formatIndiaPhoneStorage(formData.contactPhoneAlt)
          : "",
        socialInstagram: formData.socialInstagram.trim(),
        socialFacebook: formData.socialFacebook.trim(),
        socialX: formData.socialX.trim(),
        socialYoutube: formData.socialYoutube.trim(),
        location: {
          city: formData.location.city.trim(),
          displayAddress: formData.location.displayAddress.trim(),
          mapAddress: formData.location.mapAddress.trim(),
          formattedAddress: formData.location.displayAddress.trim(),
          lat:
            formData.location.lat != null && formData.location.lat !== ""
              ? Number(formData.location.lat)
              : null,
          lng:
            formData.location.lng != null && formData.location.lng !== ""
              ? Number(formData.location.lng)
              : null,
        },
        photos: Array.isArray(formData.photos)
          ? formData.photos.filter(Boolean)
          : [],
        accreditation: parseCommaSeparated(formData.accreditation),
        features: parseCommaSeparated(formData.features),
        facilities: parseCommaSeparated(formData.facilities),
        rankings: parseCommaSeparated(formData.rankings),
        highlights: parseCommaSeparated(formData.highlights),
        studyModes: {
          online: formData.studyModes?.online !== false,
          offline: formData.studyModes?.offline !== false,
        },
      };
      checkLength(formattedData.accreditation, 20, "Accreditation");
      checkLength(formattedData.features, 20, "Key Features");
      checkLength(formattedData.facilities, 20, "Campus Facilities");
      checkLength(formattedData.rankings, 20, "Rankings");
      checkLength(formattedData.highlights, 20, "At a Glance Highlights");
      checkItemCount(formattedData.accreditation, 30, "Accreditation");
      checkItemCount(formattedData.features, 30, "Key Features");
      checkItemCount(formattedData.facilities, 30, "Campus Facilities");
      checkItemCount(formattedData.rankings, 30, "Rankings");
      checkItemCount(formattedData.highlights, 30, "At a Glance Highlights");
      /* Remove local file objects that will fail Firestore serialization */ delete formattedData.logoFile;
      delete formattedData.thumbnailFile;
      delete formattedData.brochureFile;
      /* Prevent saving local blob URLs to Firestore. */ if (
        formattedData.logo &&
        formattedData.logo.startsWith("blob:")
      ) {
        formattedData.logo = "";
      }
      if (
        formattedData.thumbnail &&
        formattedData.thumbnail.startsWith("blob:")
      ) {
        formattedData.thumbnail = "";
      }
      let newId = editingId;
      if (editingId) {
        /* Update existing college document first */ await updateDoc(
          doc(db, "colleges", editingId),
          formattedData,
        );
      } else {
        /* Create a new college document first */ const docRef = await addDoc(
          collection(db, "colleges"),
          formattedData,
        );
        newId = docRef.id;
      }
      /* Upload and compress media files in parallel if provided */ const uploadPromises =
        [];
      const updates = {};
      const newGalleryUrls = [];
      if (formData.logoFile) {
        uploadPromises.push(
          (async () => {
            const compressed = await compressImage(
              formData.logoFile,
              200,
              200,
              0.7,
            );
            updates.logo = await uploadFile(
              compressed,
              `colleges/${newId}/logo`,
            );
          })(),
        );
      }
      if (formData.thumbnailFile) {
        uploadPromises.push(
          (async () => {
            const compressed = await compressImage(
              formData.thumbnailFile,
              1200,
              600,
              0.75,
            );
            updates.thumbnail = await uploadFile(
              compressed,
              `colleges/${newId}/thumbnail`,
            );
          })(),
        );
      }
      if (formData.brochureFile) {
        uploadPromises.push(
          (async () => {
            const safeName = formData.brochureFile.name.replace(
              /[^a-zA-Z0-9._-]/g,
              "-",
            );
            updates.brochure = await uploadFile(
              formData.brochureFile,
              `colleges/${newId}/brochure/${Date.now()}-${safeName}`,
            );
          })(),
        );
      }
      for (const item of pendingGallery) {
        uploadPromises.push(
          (async () => {
            const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
            const compressed = await compressImage(item.file, 1200, 900, 0.75);
            const downloadURL = await uploadFile(
              compressed,
              `colleges/${newId}/gallery/${Date.now()}-${safeName}`,
            );
            newGalleryUrls.push(downloadURL);
          })(),
        );
      }
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        if (newGalleryUrls.length > 0) {
          updates.photos = [...formattedData.photos, ...newGalleryUrls].slice(
            0,
            MAX_GALLERY_PHOTOS,
          );
        }
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, "colleges", newId), updates);
        }
      }
      removedPhotoUrls.forEach((photoUrl) => {
        const storagePath = getStoragePathFromUrl(photoUrl);
        if (storagePath) {
          deleteObject(storageRef(storage, storagePath)).catch((error) => {
            console.warn("Could not remove gallery photo:", error.message);
          });
        }
      });
      setUploadProgress(0);
      setLogoPreview("");
      setThumbnailPreview("");
      fetchColleges();
      setFeedbackMsg(
        editingId
          ? "College updated successfully!"
          : "College added successfully!",
      );
      handleCancelEdit();
    } catch (err) {
      console.error("Error saving college:", err);
      setFeedbackMsg("Error saving college: " + err.message);
    }
    setSubmitting(false);
  };
  return (
    <div ref={topRef} className="p-1 md:p-4 max-w-7xl mx-auto">
      {" "}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D0D12] tracking-tight">
            College Administration
          </h1>{" "}
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Manage and edit institutional profiles, statistics, courses, and
            media.
          </p>{" "}
          <p className="text-xs font-bold mt-2 text-primary">
            {" "}
            Home showcase: {featuredCount} campus card
            {featuredCount === 1 ? "" : "s"} enabled{" "}
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className={`w-full sm:w-auto px-5 py-3 rounded-card font-bold flex items-center justify-center gap-2 transition-all shadow-card ${showForm ? "bg-brand-bg hover:bg-gray-200 text-text-main" : "bg-primary text-white hover:bg-[#0D0D12] transition-colors duration-200 hover:shadow-card hover:shadow-[#002d62]/20"}`}
        >
          {" "}
          {showForm ? <FaTimes /> : <FaPlus />}{" "}
          {showForm ? "Close Form" : "Add College"}{" "}
        </button>{" "}
      </div>{" "}
      {showForm && (
        <div className="glass-card p-6 md:p-8 mb-10 transition-all">
          {" "}
          <h2 className="text-2xl font-bold text-gray-950 mb-6 pb-3 border-b border-border-subtle">
            {" "}
            {editingId
              ? "Edit College Details"
              : "Add New Institutional Card"}{" "}
          </h2>{" "}
          <form onSubmit={handleSubmit} className="space-y-8">
            {" "}
            {/* SECTION 1: Basic Info */}{" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                1. Primary Information
              </h3>{" "}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {" "}
                <div ref={nameRef}>
                  {" "}
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center justify-between ${submitted && !formData.name.trim() ? "text-rose-700" : "text-text-muted"}`}
                  >
                    {" "}
                    <span>College Name *</span>{" "}
                    {submitted && !formData.name.trim() && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Required
                      </span>
                    )}{" "}
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.collegeName}
                    className={`w-full border-2 rounded-card px-4 py-2.5 text-sm focus:outline-none transition-colors ${submitted && !formData.name.trim() ? "border-[#B3261E] focus:border-[#B3261E] bg-[#B3261E]/10/30" : "border-brand-border focus:border-primary glass-input"}`}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Guru Kashi University"
                  />{" "}
                  <FieldCounter
                    current={formData.name.length}
                    max={FIELD_LIMITS.collegeName}
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Type *
                  </label>{" "}
                  <select
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    {" "}
                    <option value="Private">Private</option>{" "}
                    <option value="Public">Public</option>{" "}
                    <option value="Government">Government</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Established Date
                  </label>{" "}
                  <input
                    type="date"
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.establishedDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        establishedDate: e.target.value,
                      })
                    }
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-6">
                <label className="block text-xs font-bold text-text-muted mb-2">
                  Study Modes Offered (Overview)
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 rounded-card border border-brand-border px-4 py-2.5 text-sm cursor-pointer hover:bg-brand-bg/50">
                    <input
                      type="checkbox"
                      checked={formData.studyModes?.online !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studyModes: {
                            ...formData.studyModes,
                            online: e.target.checked,
                          },
                        })
                      }
                      className="accent-primary"
                    />
                    Online / Distance Learning
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-card border border-brand-border px-4 py-2.5 text-sm cursor-pointer hover:bg-brand-bg/50">
                    <input
                      type="checkbox"
                      checked={formData.studyModes?.offline !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studyModes: {
                            ...formData.studyModes,
                            offline: e.target.checked,
                          },
                        })
                      }
                      className="accent-primary"
                    />
                    Offline / Regular
                  </label>
                </div>
                <p className="mt-2 text-[11px] text-text-muted">
                  Shown on the college overview page and limits study mode options when students apply.
                </p>
              </div>{" "}
            </div>{" "}
            {/* SECTION 2: Description and Media */}{" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                2. Description & Branding Assets
              </h3>{" "}
              <div className="space-y-4">
                {" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    About the College
                  </label>{" "}
                  <textarea
                    rows="4"
                    maxLength={FIELD_LIMITS.description}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter university description and history..."
                  ></textarea>{" "}
                  <p className="mt-1 text-right text-xs text-text-muted">
                    {formData.description.length}/{FIELD_LIMITS.description}
                  </p>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      Logo Image URL
                    </label>{" "}
                    <input
                      type="text"
                      className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={formData.logo}
                      onChange={(e) =>
                        setFormData({ ...formData, logo: e.target.value })
                      }
                      placeholder="https://example.com/logo.jpg (leave blank for NA)"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      Upload Logo from Computer
                    </label>{" "}
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setLogoPreview(URL.createObjectURL(file));
                          setFormData({ ...formData, logoFile: file });
                        }
                      }}
                    />{" "}
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="mt-2 w-16 h-16 object-contain rounded-lg border border-brand-border"
                      />
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      Banner/Thumbnail URL
                    </label>{" "}
                    <input
                      type="text"
                      className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={formData.thumbnail}
                      onChange={(e) =>
                        setFormData({ ...formData, thumbnail: e.target.value })
                      }
                      placeholder="https://example.com/banner.jpg (leave blank for NA)"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      Upload Banner from Computer
                    </label>{" "}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setThumbnailPreview(URL.createObjectURL(file));
                          setFormData({ ...formData, thumbnailFile: file });
                        }
                      }}
                      className="w-full"
                    />{" "}
                    {thumbnailPreview && (
                      <img
                        src={thumbnailPreview}
                        alt="Banner preview"
                        className="mt-2 w-full h-24 object-cover rounded-lg border border-brand-border"
                      />
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* SECTION 2B: Campus Gallery */}{" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                {" "}
                <FaImage /> Campus Gallery (up to {MAX_GALLERY_PHOTOS}{" "}
                photos){" "}
              </h3>{" "}
              <p className="text-xs text-text-muted mb-4">
                {" "}
                Upload campus photos for the college detail Gallery tab. You can
                add or remove images while creating or editing a college.{" "}
              </p>{" "}
              <div className="rounded-card border border-dashed border-brand-border bg-brand-bg/60 p-5">
                {" "}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  {" "}
                  <p className="text-xs font-bold text-text-muted">
                    {" "}
                    {totalGalleryCount}/{MAX_GALLERY_PHOTOS} photos
                    selected{" "}
                  </p>{" "}
                  <label
                    className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-xs font-bold transition ${totalGalleryCount >= MAX_GALLERY_PHOTOS ? "bg-gray-200 text-text-muted cursor-not-allowed" : "bg-primary text-white hover:bg-[#0D0D12] transition-colors duration-200 cursor-pointer"}`}
                  >
                    {" "}
                    <FaPlus /> Add Gallery Photos{" "}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={totalGalleryCount >= MAX_GALLERY_PHOTOS}
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />{" "}
                  </label>{" "}
                </div>{" "}
                {formData.photos.length > 0 || pendingGallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {" "}
                    {formData.photos.map((photoUrl) => (
                      <div
                        key={photoUrl}
                        className="relative group rounded-card overflow-hidden border border-brand-border bg-white"
                      >
                        {" "}
                        <img
                          src={photoUrl}
                          alt="Saved gallery"
                          className="h-28 w-full object-cover"
                        />{" "}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSavedGalleryPhoto(photoUrl)
                          }
                          className="absolute top-2 right-2 rounded-full bg-error text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-card"
                          aria-label="Remove gallery photo"
                        >
                          {" "}
                          <FaTrashAlt className="text-xs" />{" "}
                        </button>{" "}
                      </div>
                    ))}{" "}
                    {pendingGallery.map((item) => (
                      <div
                        key={item.id}
                        className="relative group rounded-card overflow-hidden border border-brand-bg bg-white"
                      >
                        {" "}
                        <img
                          src={item.preview}
                          alt="Pending gallery upload"
                          className="h-28 w-full object-cover"
                        />{" "}
                        <span className="absolute top-2 left-2 rounded-full bg-primary text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                          {" "}
                          New{" "}
                        </span>{" "}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemovePendingGalleryPhoto(item.id)
                          }
                          className="absolute top-2 right-2 rounded-full bg-error text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-card"
                          aria-label="Remove pending gallery photo"
                        >
                          {" "}
                          <FaTrashAlt className="text-xs" />{" "}
                        </button>{" "}
                      </div>
                    ))}{" "}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-[#5B5B63]/60">
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-14 h-14 mb-3 opacity-40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />{" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />{" "}
                    </svg>{" "}
                    <p className="text-sm font-semibold text-text-muted tracking-wide">
                      No Picture
                    </p>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
            {/* SECTION 3: Stats and Contact */}{" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                3. Quantitative Metrics & Contact
              </h3>{" "}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Student Count
                  </label>{" "}
                  <input
                    type="number"
                    min={0}
                    max={FIELD_LIMITS.maxStudentCount}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.studentCount}
                    onChange={(e) =>
                      setFormData({ ...formData, studentCount: e.target.value })
                    }
                    placeholder="e.g. 7000"
                  />{" "}
                  <p className="text-[10px] text-text-muted mt-1">
                    Number only, up to{" "}
                    {FIELD_LIMITS.maxStudentCount.toLocaleString()}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Rating (out of 5)
                  </label>{" "}
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.averageReview || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        averageReview: e.target.value,
                      })
                    }
                    placeholder="e.g. 4.5"
                  />{" "}
                  <p className="text-[10px] text-text-muted mt-1">
                    Enter rating between 0 and 5 (supports decimals like 4.5)
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Website URL
                  </label>{" "}
                  <input
                    type="text"
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://www.gku.ac.in"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Contact Email
                  </label>{" "}
                  <input
                    type="email"
                    maxLength={FIELD_LIMITS.email}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="admissions@gku.ac.in"
                  />{" "}
                  <FieldCounter
                    current={formData.contactEmail.length}
                    max={FIELD_LIMITS.email}
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Contact Phone (India)
                  </label>{" "}
                  <div className="flex">
                    {" "}
                    <span className="inline-flex items-center gap-2 rounded-l-card border border-r-0 border-brand-border bg-brand-bg px-3 py-2.5 text-sm font-bold text-primary">
                      <FaPhone className="text-text-muted text-xs" />
                      +91
                    </span>{" "}
                    <div className="flex-1">
                      {" "}
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={FIELD_LIMITS.footerPhone}
                        className="w-full rounded-r-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          updateContactPhoneField(
                            "contactPhone",
                            e.target.value,
                          )
                        }
                        placeholder="9501583376"
                      />{" "}
                      <p className="mt-1 text-right text-[10px] text-text-muted">
                        {formData.contactPhone.length}/
                        {FIELD_LIMITS.footerPhone} digits after +91
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Alternative Phone (India)
                  </label>{" "}
                  <div className="flex">
                    {" "}
                    <span className="inline-flex items-center gap-2 rounded-l-card border border-r-0 border-brand-border bg-brand-bg px-3 py-2.5 text-sm font-bold text-primary">
                      <FaPhone className="text-text-muted text-xs" />
                      +91
                    </span>{" "}
                    <div className="flex-1">
                      {" "}
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={FIELD_LIMITS.footerPhone}
                        className="w-full rounded-r-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                        value={formData.contactPhoneAlt}
                        onChange={(e) =>
                          updateContactPhoneField(
                            "contactPhoneAlt",
                            e.target.value,
                          )
                        }
                        placeholder="9876543210"
                      />{" "}
                      <p className="mt-1 text-right text-[10px] text-text-muted">
                        {formData.contactPhoneAlt.length}/
                        {FIELD_LIMITS.footerPhone} digits after +91
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    Instagram Profile
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.socialInstagram}
                    onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    Facebook Profile
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.socialFacebook}
                    onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    X (Twitter) Profile
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.socialX}
                    onChange={(e) => setFormData({ ...formData, socialX: e.target.value })}
                    placeholder="https://x.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.socialYoutube}
                    onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>{" "}
            {/* SECTION 4: Location */}{" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                4. Location & Address
              </h3>{" "}
              <p className="text-xs text-text-muted mb-4">
                {" "}
                Use the public address for the college overview page, and the
                map search address to find the exact pin on the map.{" "}
              </p>{" "}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {" "}
                <div ref={cityRef}>
                  {" "}
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center justify-between ${submitted && !formData.location.city.trim() ? "text-rose-700" : "text-text-muted"}`}
                  >
                    {" "}
                    <span>City *</span>{" "}
                    {submitted && !formData.location.city.trim() && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Required
                      </span>
                    )}{" "}
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.city}
                    className={`w-full border-2 rounded-card px-4 py-2.5 text-sm focus:outline-none transition-colors ${submitted && !formData.location.city.trim() ? "border-[#B3261E] focus:border-[#B3261E] bg-[#B3261E]/10/30" : "border-brand-border focus:border-primary glass-input"}`}
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Talwandi Sabo"
                  />{" "}
                  <p className="mt-1 text-right text-xs text-text-muted">
                    {formData.location.city.length}/{FIELD_LIMITS.city}
                  </p>{" "}
                </div>{" "}
                <div className="md:col-span-2" ref={displayAddressRef}>
                  {" "}
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center justify-between ${submitted && !formData.location.displayAddress.trim() ? "text-rose-700" : "text-text-muted"}`}
                  >
                    {" "}
                    <span>Public Address (Overview) *</span>{" "}
                    {submitted && !formData.location.displayAddress.trim() && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Required
                      </span>
                    )}{" "}
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.displayAddress}
                    className={`w-full border-2 rounded-card px-4 py-2.5 text-sm focus:outline-none transition-colors ${submitted && !formData.location.displayAddress.trim() ? "border-[#B3261E] focus:border-[#B3261E] bg-[#B3261E]/10/30" : "border-brand-border focus:border-primary glass-input"}`}
                    value={formData.location.displayAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          displayAddress: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 225A Krishna Enclave, Kharar"
                  />{" "}
                  <p className="mt-1 text-right text-xs text-text-muted">
                    {" "}
                    {formData.location.displayAddress.length}/
                    {FIELD_LIMITS.displayAddress} — shown on the college
                    overview page{" "}
                  </p>{" "}
                </div>{" "}
                <div className="md:col-span-3" ref={mapAddressRef}>
                  {" "}
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center justify-between ${submitted && !formData.location.mapAddress.trim() ? "text-rose-700" : "text-text-muted"}`}
                  >
                    {" "}
                    <span>Map Search Address *</span>{" "}
                    {submitted && !formData.location.mapAddress.trim() && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Required
                      </span>
                    )}{" "}
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.mapAddress}
                    className={`w-full border-2 rounded-card px-4 py-2.5 text-sm focus:outline-none transition-colors ${submitted && !formData.location.mapAddress.trim() ? "border-[#B3261E] focus:border-[#B3261E] bg-[#B3261E]/10/30" : "border-brand-border focus:border-primary glass-input"}`}
                    value={formData.location.mapAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          mapAddress: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Guru Kashi University, SH-17, Talwandi Sabo 151302, Punjab, India"
                  />{" "}
                  <p className="mt-1 text-right text-xs text-text-muted">
                    {" "}
                    {formData.location.mapAddress.length}/
                    {FIELD_LIMITS.mapAddress} — used to search and pin the
                    location on the map{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-6">
                {" "}
                <Suspense fallback={<MapPickerFallback />}>
                  <LocationMapPicker
                    location={formData.location}
                    onChange={(nextLocation) =>
                      setFormData({ ...formData, location: nextLocation })
                    }
                    searchQuery={[
                      formData.location.mapAddress,
                      formData.location.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </Suspense>{" "}
              </div>{" "}
            </div>{" "}
            {/* SECTION 5: Taxonomies / Tags */}{" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                5. Accreditations, Features, Rankings, & Highlights
              </h3>{" "}
              <p className="text-xs text-text-muted mb-4">
                Enter multiple items separated by commas.
              </p>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Accreditations (comma-separated)
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.commaList}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.accreditation}
                    onChange={(e) =>
                      handleCommaListChange("accreditation", e.target.value)
                    }
                    placeholder="e.g. WASC, NAAC A++, UGC"
                  />{" "}
                  <p className="text-[10px] text-text-muted text-right mt-1">
                    {formData.accreditation
                      ? formData.accreditation
                          .split(",")
                          .filter((x) => x.trim()).length
                      : 0}
                    /30 items (max 20 chars per item)
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Key Features (comma-separated)
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.commaList}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.features}
                    onChange={(e) =>
                      handleCommaListChange("features", e.target.value)
                    }
                    placeholder="e.g. Diverse Programs, High Placement, Wi-Fi Campus"
                  />{" "}
                  <p className="text-[10px] text-text-muted text-right mt-1">
                    {formData.features
                      ? formData.features.split(",").filter((x) => x.trim())
                          .length
                      : 0}
                    /30 items (max 20 chars per item)
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Campus Facilities (comma-separated)
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.commaList}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.facilities}
                    onChange={(e) =>
                      handleCommaListChange("facilities", e.target.value)
                    }
                    placeholder="e.g. Innovation Labs, Library, Sports, Cafeteria"
                  />{" "}
                  <p className="text-[10px] text-text-muted text-right mt-1">
                    {formData.facilities
                      ? formData.facilities.split(",").filter((x) => x.trim())
                          .length
                      : 0}
                    /30 items (max 20 chars per item)
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Rankings & Accolades (comma-separated)
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.commaList}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.rankings}
                    onChange={(e) =>
                      handleCommaListChange("rankings", e.target.value)
                    }
                    placeholder="e.g. #3 National Universities, #1 Most Innovative"
                  />{" "}
                  <p className="text-[10px] text-text-muted text-right mt-1">
                    {formData.rankings
                      ? formData.rankings.split(",").filter((x) => x.trim())
                          .length
                      : 0}
                    /30 items (max 20 chars per item)
                  </p>{" "}
                </div>{" "}
                <div className="md:col-span-2">
                  {" "}
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    Quick Fact Banner Highlights (comma-separated)
                  </label>{" "}
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.commaList}
                    className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={formData.highlights}
                    onChange={(e) =>
                      handleCommaListChange("highlights", e.target.value)
                    }
                    placeholder="e.g. 28+ Years of Academic Expertise, 7000+ Current Students, 100+ Acres Campus"
                  />{" "}
                  <p className="text-[10px] text-text-muted text-right mt-1">
                    {formData.highlights
                      ? formData.highlights.split(",").filter((x) => x.trim())
                          .length
                      : 0}
                    /30 items (max 20 chars per item)
                  </p>{" "}
                </div>{" "}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      Brochure Link / Path
                    </label>{" "}
                    <input
                      type="text"
                      className="w-full border border-brand-border rounded-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={formData.brochure}
                      onChange={(e) =>
                        setFormData({ ...formData, brochure: e.target.value })
                      }
                      placeholder="e.g. https://example.com/brochure.pdf"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      Upload Brochure from Computer
                    </label>{" "}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="w-full"
                      onChange={handleBrochureUpload}
                    />{" "}
                    <p className="mt-1 text-[10px] text-text-muted">
                      PDF only, max 4 MB
                    </p>{" "}
                    {formData.brochureFile && (
                      <p className="mt-2 rounded-card border border-brand-border bg-brand-bg/60 px-3 py-2 text-xs text-text-main">
                        Selected: {formData.brochureFile.name}
                      </p>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* SECTION 6: Courses Table Editor */}{" "}
            <div
              ref={coursesRef}
              className={`border rounded-card p-5 transition-colors ${submitted && formData.courses.length === 0 ? "border-rose-300 bg-[#B3261E]/10/20" : "border-border-subtle bg-brand-bg/50"}`}
            >
              {" "}
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                {" "}
                <FaGraduationCap /> 6. Dynamic Academic Courses & Fee Structure{" "}
                {submitted && formData.courses.length === 0 && (
                  <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ml-1">
                    ⚠ At least 1 course required
                  </span>
                )}{" "}
              </h3>{" "}
              {/* Course Adder inputs */}{" "}
              <div className="glass-card p-5 space-y-4 mb-6">
                {" "}
                <h4 className="text-xs font-bold text-text-main uppercase tracking-widest">
                  Add a Course Row
                </h4>{" "}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Course Name
                    </label>{" "}
                    <input
                      type="text"
                      maxLength={FIELD_LIMITS.courseName}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.name}
                      onChange={(e) =>
                        setTempCourse({ ...tempCourse, name: e.target.value })
                      }
                      placeholder="e.g. Bachelor of Technology"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.name.length}
                      max={FIELD_LIMITS.courseName}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Specialization
                    </label>{" "}
                    <input
                      type="text"
                      maxLength={FIELD_LIMITS.specialization}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.specialization}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="e.g. Civil Engineering"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.specialization.length}
                      max={FIELD_LIMITS.specialization}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Duration
                    </label>{" "}
                    <input
                      type="text"
                      maxLength={FIELD_LIMITS.duration}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.duration}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          duration: e.target.value,
                        })
                      }
                      placeholder="e.g. 4 Years"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.duration.length}
                      max={FIELD_LIMITS.duration}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Mode
                    </label>{" "}
                    <input
                      type="text"
                      maxLength={FIELD_LIMITS.mode}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.mode}
                      onChange={(e) =>
                        setTempCourse({ ...tempCourse, mode: e.target.value })
                      }
                      placeholder="e.g. Full Time"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.mode.length}
                      max={FIELD_LIMITS.mode}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Tuition Fees
                    </label>{" "}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={FIELD_LIMITS.fee}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.tuitionFees}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          tuitionFees: sanitizeFeeInput(e.target.value),
                        })
                      }
                      placeholder="e.g. 518398"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.tuitionFees.length}
                      max={FIELD_LIMITS.fee}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Term Fees
                    </label>{" "}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={FIELD_LIMITS.fee}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.termFees}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          termFees: sanitizeFeeInput(e.target.value),
                        })
                      }
                      placeholder="e.g. 10000"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.termFees.length}
                      max={FIELD_LIMITS.fee}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Term Structure
                    </label>{" "}
                    <select
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.termStructure}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          termStructure: e.target.value,
                        })
                      }
                    >
                      {" "}
                      <option value="Yearly">Yearly</option>{" "}
                      <option value="Semester">Semester</option>{" "}
                      <option value="One Time">One Time</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Registration Fee
                    </label>{" "}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={FIELD_LIMITS.fee}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.registration}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          registration: sanitizeFeeInput(e.target.value),
                        })
                      }
                      placeholder="e.g. 5000"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.registration.length}
                      max={FIELD_LIMITS.fee}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Total Fee
                    </label>{" "}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={FIELD_LIMITS.fee}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.total}
                      onChange={(e) =>
                        setTempCourse({
                          ...tempCourse,
                          total: sanitizeFeeInput(e.target.value),
                        })
                      }
                      placeholder="e.g. 533398"
                    />{" "}
                    <FieldCounter
                      current={tempCourse.total.length}
                      max={FIELD_LIMITS.fee}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] font-bold text-text-muted mb-1">
                      Seats Available
                    </label>{" "}
                    <input
                      type="number"
                      min={0}
                      max={FIELD_LIMITS.maxSeats}
                      className="w-full border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                      value={tempCourse.seats}
                      onChange={(e) =>
                        setTempCourse({ ...tempCourse, seats: e.target.value })
                      }
                      placeholder="e.g. 60"
                    />{" "}
                    <p className="text-[10px] text-text-muted mt-1">
                      0–{FIELD_LIMITS.maxSeats.toLocaleString()}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  type="button"
                  onClick={addCourseToTable}
                  className="bg-primary text-white font-bold px-4 py-2 rounded-card text-xs flex items-center gap-1 hover:bg-[#A8813E] transition-colors duration-200 transition-colors"
                >
                  {" "}
                  <FaPlus /> Add Course Row{" "}
                </button>{" "}
              </div>{" "}
              {/* Course list table preview */}{" "}
              <div className="overflow-x-auto glass-card">
                {" "}
                <table className="w-full text-left border-collapse min-w-[700px]">
                  {" "}
                  <thead>
                    {" "}
                    <tr className="border-b border-border-subtle bg-brand-bg/50">
                      {" "}
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Name & Specialization
                      </th>{" "}
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Duration & Mode
                      </th>{" "}
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Fees Detail
                      </th>{" "}
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Seats
                      </th>{" "}
                      <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">
                        Action
                      </th>{" "}
                    </tr>{" "}
                  </thead>{" "}
                  <tbody>
                    {" "}
                    {formData.courses.map((course, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-50 last:border-0 hover:bg-brand-bg/80 transition-colors duration-200/50"
                      >
                        {" "}
                        <td className="py-3 px-4">
                          {" "}
                          <p className="font-bold text-[#0D0D12] text-xs">
                            {course.name}
                          </p>{" "}
                          <p className="text-[9px] text-primary font-semibold uppercase">
                            {course.specialization || "General"}
                          </p>{" "}
                        </td>{" "}
                        <td className="py-3 px-4">
                          {" "}
                          <p className="text-xs text-[#0D0D12]">
                            {course.duration || "N/A"}
                          </p>{" "}
                          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">
                            {course.mode || "Full Time"}
                          </p>{" "}
                        </td>{" "}
                        <td className="py-3 px-4">
                          {" "}
                          <p className="text-xs text-[#0D0D12] font-bold">
                            Total: {course.total || "N/A"}
                          </p>{" "}
                          <p className="text-[9px] text-text-muted">
                            Tuition: {course.tuitionFees || "N/A"} • Term:{" "}
                            {course.termFees || "N/A"} (
                            {course.termStructure || "Yearly"})
                          </p>{" "}
                        </td>{" "}
                        <td className="py-3 px-4 text-xs font-bold text-[#0D0D12]">
                          {course.seats || "N/A"}
                        </td>{" "}
                        <td className="py-3 px-4 text-center">
                          {" "}
                          <div className="flex items-center justify-center gap-2">
                            {" "}
                            <button
                              type="button"
                              onClick={() => editCourseFromTable(idx)}
                              className="text-primary hover:text-accent transition-colors duration-200 p-1.5 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Course"
                            >
                              {" "}
                              <FaEdit className="text-xs" />{" "}
                            </button>{" "}
                            <button
                              type="button"
                              onClick={() => removeCourseFromTable(idx)}
                              className="text-[#B3261E] hover:text-[#B3261E] p-1.5 hover:bg-[#B3261E]/10 rounded-lg transition"
                              title="Remove Course"
                            >
                              {" "}
                              <FaTrashAlt className="text-xs" />{" "}
                            </button>{" "}
                          </div>{" "}
                        </td>{" "}
                      </tr>
                    ))}{" "}
                    {formData.courses.length === 0 && (
                      <tr>
                        {" "}
                        <td
                          colSpan="5"
                          className="py-6 text-center text-xs text-text-muted font-medium"
                        >
                          No courses added. Old string-based mapping or
                          fallbacks will be displayed on client.
                        </td>{" "}
                      </tr>
                    )}{" "}
                  </tbody>{" "}
                </table>{" "}
              </div>{" "}
            </div>{" "}
            {/* Submit / Action buttons */}{" "}
            <div className="flex gap-4 pt-4">
              {" "}
              <button
                type="submit"
                disabled={submitting}
                className={`bg-primary text-white px-8 py-3 rounded-card font-bold transition-all hover:shadow-card hover:shadow-[#002d62]/20 ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-[#0D0D12] transition-colors duration-200"}`}
              >
                {" "}
                {submitting ? (
                  <span className="flex items-center gap-2">
                    {" "}
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />{" "}
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />{" "}
                    </svg>{" "}
                    {uploadProgress > 0
                      ? `Uploading images… ${uploadProgress}%`
                      : "Saving…"}{" "}
                  </span>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Publish College Card"
                )}{" "}
              </button>{" "}
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-brand-bg hover:bg-gray-200 text-text-main px-6 py-3 rounded-card font-bold transition"
                >
                  {" "}
                  Cancel Edit{" "}
                </button>
              )}{" "}
            </div>{" "}
            {feedbackMsg && (
              <p className="mt-4 text-center text-sm font-medium text-primary">
                {" "}
                {feedbackMsg}{" "}
              </p>
            )}{" "}
          </form>{" "}
        </div>
      )}{" "}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          {" "}
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>{" "}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {" "}
          {colleges.map((college) => (
            <div
              key={college._id}
              className="glass-card overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-150 ease-in-out"
            >
              {" "}
              <div className="relative h-40 bg-brand-bg">
                {" "}
                <img
                  src={
                    college.thumbnail ||
                    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f"
                  }
                  alt={college.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f";
                  }}
                />{" "}
                <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {" "}
                  {college.type}{" "}
                </div>{" "}
                {/* Star Rating Badge */}{" "}
                <div className="absolute top-3 right-3 glass-chip text-[#0D0D12] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-card">
                  {" "}
                  <FaStar className="text-accent text-[10px]" />{" "}
                  {college.averageReview
                    ? Number(college.averageReview).toFixed(1)
                    : "N/A"}{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-5 flex-1 flex flex-col">
                {" "}
                <h3 className="font-extrabold text-[#0D0D12] leading-snug mb-1 text-base">
                  {college.name}
                </h3>{" "}
                <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
                  {" "}
                  <FaMapMarkerAlt />{" "}
                  {college.location?.city || "Unknown City"}{" "}
                </div>{" "}
                <div className="flex items-center justify-between gap-4 rounded-card border border-brand-bg bg-background p-3 mb-4">
                  {" "}
                  <div>
                    {" "}
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                      Top Rated Campus
                    </p>{" "}
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Show this card on the home page.
                    </p>{" "}
                  </div>{" "}
                  <button
                    type="button"
                    onClick={() => handleToggleHomeShowcase(college)}
                    className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full transition-colors ${college.showOnHome ? "bg-primary" : "bg-gray-300"}`}
                    aria-pressed={Boolean(college.showOnHome)}
                    aria-label={`Toggle ${college.name} on home page`}
                  >
                    {" "}
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${college.showOnHome ? "translate-x-7" : "translate-x-1"}`}
                    />{" "}
                  </button>{" "}
                </div>{" "}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {" "}
                  <button
                    onClick={() => handleStartEdit(college)}
                    className="bg-brand-bg border border-border-subtle text-text-main py-2.5 rounded-card font-bold text-xs hover:bg-brand-bg/80 transition-colors duration-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    {" "}
                    <FaEdit /> Edit Info{" "}
                  </button>{" "}
                  <button
                    onClick={() => handleDelete(college._id)}
                    className="bg-red-50 text-[#B3261E] py-2.5 rounded-card font-bold text-xs hover:bg-error transition-all flex items-center justify-center gap-1.5"
                  >
                    {" "}
                    <FaTrashAlt /> Delete Card{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ))}{" "}
          {colleges.length === 0 && (
            <p className="text-text-muted col-span-3 text-center py-20 font-medium glass-card">
              No colleges found in Firestore.
            </p>
          )}{" "}
        </div>
      )}{" "}
    </div>
  );
}
