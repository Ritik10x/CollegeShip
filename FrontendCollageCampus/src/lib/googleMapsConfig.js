import { firebaseConfig } from "../firebase";
export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || firebaseConfig.apiKey;
export const GOOGLE_MAPS_LIBRARIES = ["places"];
