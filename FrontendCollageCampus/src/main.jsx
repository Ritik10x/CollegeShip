import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { CollegesProvider } from "./context/CollegesContext.jsx";
import ShipLoaderIllustration from "./components/ShipLoaderIllustration.jsx";

const splashScene = document.querySelector(".app-splash__scene");
if (splashScene) {
  createRoot(splashScene).render(<ShipLoaderIllustration />);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <CollegesProvider>
        <App />
      </CollegesProvider>
    </UserProvider>
  </StrictMode>,
);
