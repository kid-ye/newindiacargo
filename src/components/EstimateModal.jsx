import { useState } from "react";
import { SHIPPING_RATES } from "../config";
import Modal from "./Modal";
import ShippingModeSelector from "./ShippingModeSelector";

export default function EstimateModal({ onClose }) {
  const [shipMode, setShipMode] = useState("train");
  const [estimate, setEstimate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const weight = parseFloat(f.weight.value);
    const mode = f.mode.value;
    setEstimate({
      pickup: f.pickup.value,
      dropoff: f.dropoff.value,
      mode,
      weight,
      total: (SHIPPING_RATES[mode] * weight).toFixed(2),
    });
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="callback-title">Get an Estimate</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="pickup"
          placeholder="Pickup location"
          required
        />
        <input
          type="text"
          name="dropoff"
          placeholder="Drop-off location"
          required
        />
        <ShippingModeSelector
          shipMode={shipMode}
          setShipMode={setShipMode}
          className="estimate-modes"
        />
        <input
          type="number"
          name="weight"
          placeholder="Weight (kg)"
          min="0.1"
          step="0.1"
          required
        />
        {estimate && (
          <div className="estimate-result">
            <div className="estimate-route">
              {estimate.pickup} → {estimate.dropoff}
            </div>
            <div className="estimate-amount">₹{estimate.total}</div>
            <div className="estimate-meta">
              {estimate.weight} kg · {estimate.mode}
            </div>
          </div>
        )}
        <button type="submit" className="auth-submit">
          Calculate
        </button>
      </form>
    </Modal>
  );
}
