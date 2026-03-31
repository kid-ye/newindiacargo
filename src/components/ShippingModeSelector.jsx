import { SHIPPING_MODES } from "../config";

export default function ShippingModeSelector({
  shipMode,
  setShipMode,
  className = "dash-modes",
}) {
  return (
    <div className={className}>
      {SHIPPING_MODES.map((m) => (
        <label
          key={m.value}
          className={`mode-option${shipMode === m.value ? " selected" : ""}`}
        >
          <input
            type="radio"
            name="mode"
            value={m.value}
            checked={shipMode === m.value}
            onChange={() => setShipMode(m.value)}
          />
          <span className="mode-label">{m.label}</span>
          <span className="mode-sub">{m.sub}</span>
        </label>
      ))}
    </div>
  );
}
