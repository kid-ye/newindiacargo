import { useState } from "react";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import AuthPanel from "./components/AuthPanel";
import EstimateModal from "./components/EstimateModal";
import CallbackForm from "./components/CallbackForm";
import Modal from "./components/Modal";
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { useAuth } from "./hooks/useAuth";
import heroImage from "../assets/hero.png";
import dhlLogo from "../assets/logo/DHL.png";
import dtdcLogo from "../assets/logo/dtdc.png";
import indiaPostLogo from "../assets/logo/India_Post.png";
import skykingLogo from "../assets/logo/skyking.png";
import stCourierLogo from "../assets/logo/st_courier.jpeg";
import professionalCourierLogo from "../assets/logo/theprofessionalcourier.png";

const stats = [
  { value: "24/7", label: "Shipment support" },
  { value: "99%", label: "On-time coordination" },
  { value: "120+", label: "Delivery corridors" },
];

const deliveryPartners = [
  { name: "SkyKing", logo: skykingLogo, elevate: true },
  {
    name: "The Professional Couriers",
    logo: professionalCourierLogo,
    elevate: true,
  },
  { name: "DTDC", logo: dtdcLogo, elevate: false },
  { name: "ST Courier", logo: stCourierLogo, elevate: true },
  { name: "DHL", logo: dhlLogo, elevate: false },
  { name: "India Post", logo: indiaPostLogo, elevate: true },
];

const majorCities = [
  { name: "Mumbai", top: "24%", left: "14%" },
  { name: "Jaipur", top: "28%", left: "28%" },
  { name: "Chandigarh", top: "33%", left: "42%" },
  { name: "Delhi", top: "19%", left: "57%" },
  { name: "Patna", top: "29%", left: "73%" },
  { name: "Kolkata", top: "43%", left: "86%" },
  { name: "Ahmedabad", top: "45%", left: "18%" },
  { name: "Surat", top: "58%", left: "11%" },
  { name: "Pune", top: "68%", left: "24%" },
  { name: "Bhopal", top: "53%", left: "40%" },
  { name: "Lucknow", top: "39%", left: "60%" },
  { name: "Hyderabad", top: "61%", left: "62%" },
  { name: "Bengaluru", top: "81%", left: "58%" },
  { name: "Chennai", top: "74%", left: "79%" },
];

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showCallback, setShowCallback] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);

  const { user, handleLogin, handleLogout } = useAuth();
  const { heroRef, visibleFrame, scrollProgress } =
    useScrollAnimation(heroImage);

  const zoomProgress = Math.pow(scrollProgress, 0.55);
  const heroScale = 1 + zoomProgress * 6.8;
  const heroTranslateY = zoomProgress * -42;
  const textFadeProgress = Math.min(scrollProgress / 0.18, 1);
  const heroTextOpacity = 1 - textFadeProgress;
  const heroTextTranslateY = textFadeProgress * -24;
  const heroGradientOpacity = 1 - scrollProgress * 0.72;
  const coverageFadeProgress = Math.min(
    Math.max((scrollProgress - 0.66) / 0.14, 0),
    1,
  );
  const coverageTextTranslateY = (1 - coverageFadeProgress) * 18;
  const citiesEntryStart = 0.78;
  const citiesEntryStagger = 0.008;
  const citiesEntryDuration = 0.085;

  if (user) {
    if (user.role === "admin")
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="page-shell">
      <section className="hero-scroll-scene" ref={heroRef}>
        <div className="hero-stage">
          <div className="hero-artboard">
            <div
              className="hero-sequence"
              style={{
                backgroundImage: `url(${visibleFrame})`,
              }}
            />
            <div
              className="hero-gradient"
              style={{
                opacity: heroGradientOpacity,
              }}
            />
            <div className="hero-overlay">
              <div
                aria-label="New India Cargo hero"
                className="hero-foreground"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  transform: `translate3d(0, ${heroTranslateY}vh, 0) scale(${heroScale})`,
                }}
              />
            </div>
            <div
              className="hero-content-wrap"
              style={{
                opacity: heroTextOpacity,
                transform: `translate3d(0, ${heroTextTranslateY}px, 0)`,
              }}
            >
              <div className="hero-content">
                <p className="eyebrow">New India Cargo</p>
                <h1>
                  Fast, reliable cargo movement with full-journey visibility.
                </h1>
                <p className="hero-copy">
                  From first-mile pickup to final delivery, we help businesses
                  move freight with speed, confidence, and real-time
                  coordination.
                </p>
                <div className="hero-actions">
                  <a className="primary-action" href="#services">
                    Explore services
                  </a>
                  <a
                    className="secondary-action"
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0 });
                      setShowCallback(true);
                    }}
                  >
                    Request a callback
                  </a>
                  <a
                    className="secondary-action"
                    href="#estimate"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0 });
                      setShowEstimate(true);
                    }}
                  >
                    Get an estimate
                  </a>
                </div>
                <div className="stats-grid">
                  {stats.map((stat) => (
                    <article className="stat-card" key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <aside
              className="hero-partners-wrap"
              style={{
                opacity: heroTextOpacity,
                transform: `translate3d(0, ${heroTextTranslateY}px, 0)`,
              }}
            >
              <p className="hero-partners-title">Our delivery partners</p>
              <div className="hero-partners-grid">
                {deliveryPartners.map((partner) => (
                  <div className="hero-partner-item" key={partner.name}>
                    <div className="hero-partner-logo-wrap">
                      <img
                        alt={partner.name}
                        className={`hero-partner-logo${partner.elevate ? " hero-partner-logo-elevated" : ""}`}
                        src={partner.logo}
                      />
                    </div>
                    <span className="hero-partner-name">{partner.name}</span>
                  </div>
                ))}
              </div>
            </aside>
            <div
              className="hero-coverage-label"
              style={{
                opacity: coverageFadeProgress,
                transform: `translate3d(0, ${coverageTextTranslateY}px, 0)`,
              }}
            >
              All India Coverage
            </div>
            <div className="hero-cities-layer">
              {majorCities.map((city, index) => {
                const cityProgress = Math.min(
                  Math.max(
                    (scrollProgress -
                      (citiesEntryStart + index * citiesEntryStagger)) /
                      citiesEntryDuration,
                    0,
                  ),
                  1,
                );
                const cityEase = cityProgress * cityProgress;
                const cityOpacity = cityEase;
                const cityTranslateY = (1 - cityEase) * 18;
                const cityScale = 0.92 + cityEase * 0.08;

                return (
                  <div
                    className="hero-city-label"
                    key={city.name}
                    style={{
                      top: city.top,
                      left: city.left,
                      opacity: cityOpacity,
                      transform: `translate3d(-50%, ${cityTranslateY}px, 0) scale(${cityScale})`,
                    }}
                  >
                    {city.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {showEstimate && <EstimateModal onClose={() => setShowEstimate(false)} />}

      {showCallback && (
        <Modal onClose={() => setShowCallback(false)}>
          <h2 className="callback-title">Request a Callback</h2>
          <CallbackForm />
        </Modal>
      )}

      {user ? (
        <div className="auth-fab user-menu">
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button className="auth-fab" onClick={() => setShowAuth(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      )}

      {showAuth && (
        <AuthPanel onLogin={handleLogin} onClose={() => setShowAuth(false)} />
      )}
    </main>
  );
}

export default App;
