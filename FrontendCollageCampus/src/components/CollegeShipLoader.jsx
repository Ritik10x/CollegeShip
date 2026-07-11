import ShipLoaderIllustration from "./ShipLoaderIllustration";

export default function CollegeShipLoader({
  label = "Loading CollegeShip…",
  compact = false,
}) {
  return (
    <div
      className={`collegeship-loader ${compact ? "collegeship-loader--compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="collegeship-loader__scene" aria-hidden="true">
        <ShipLoaderIllustration />
      </div>
      {!compact && (
        <>
          <p className="collegeship-loader__brand">
            College<span>Ship</span>
          </p>
          <p className="collegeship-loader__label">{label}</p>
        </>
      )}
      {compact && <p className="collegeship-loader__label">{label}</p>}
    </div>
  );
}
