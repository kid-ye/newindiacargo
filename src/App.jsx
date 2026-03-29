import { useEffect, useMemo, useRef, useState } from 'react';
import heroImage from '../assets/hero.png';
import dhlLogo from '../assets/logo/DHL.png';
import dtdcLogo from '../assets/logo/dtdc.png';
import indiaPostLogo from '../assets/logo/India_Post.png';
import skykingLogo from '../assets/logo/skyking.png';
import stCourierLogo from '../assets/logo/st_courier.jpeg';
import professionalCourierLogo from '../assets/logo/theprofessionalcourier.png';

const HERO_OVERLAY_OPTIONS = {
  showText: true,
  showGradient: true,
};

const stats = [
  { value: '24/7', label: 'Shipment support' },
  { value: '99%', label: 'On-time coordination' },
  { value: '120+', label: 'Delivery corridors' },
];

const deliveryPartners = [
  { name: 'SkyKing', logo: skykingLogo, elevate: true },
  { name: 'The Professional Couriers', logo: professionalCourierLogo, elevate: true },
  { name: 'DTDC', logo: dtdcLogo, elevate: false },
  { name: 'ST Courier', logo: stCourierLogo, elevate: true },
  { name: 'DHL', logo: dhlLogo, elevate: false },
  { name: 'India Post', logo: indiaPostLogo, elevate: true },
];

const majorCities = [
  { name: 'Mumbai', top: '24%', left: '14%' },
  { name: 'Jaipur', top: '28%', left: '28%' },
  { name: 'Chandigarh', top: '33%', left: '42%' },
  { name: 'Delhi', top: '19%', left: '57%' },
  { name: 'Patna', top: '29%', left: '73%' },
  { name: 'Kolkata', top: '43%', left: '86%' },
  { name: 'Ahmedabad', top: '45%', left: '18%' },
  { name: 'Surat', top: '58%', left: '11%' },
  { name: 'Pune', top: '68%', left: '24%' },
  { name: 'Bhopal', top: '53%', left: '40%' },
  { name: 'Lucknow', top: '39%', left: '60%' },
  { name: 'Hyderabad', top: '61%', left: '62%' },
  { name: 'Bengaluru', top: '81%', left: '58%' },
  { name: 'Chennai', top: '74%', left: '79%' },
];

const sequenceFrames = Object.entries(
  import.meta.glob('../assets/sequence_bg/*.webp', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([frameA], [frameB]) => frameA.localeCompare(frameB, undefined, { numeric: true }))
  .map(([, frameUrl]) => frameUrl);

const preloadFrame = (frameUrl) =>
  new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';

    const finish = () => resolve(frameUrl);

    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().catch(() => null).finally(finish);
        return;
      }

      finish();
    };

    image.onerror = finish;
    image.src = frameUrl;

    if (image.complete) {
      image.onload();
    }
  });

function App() {
  const heroRef = useRef(null);
  const preloadedFramesRef = useRef(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleFrame, setVisibleFrame] = useState(sequenceFrames[0] ?? heroImage);

  useEffect(() => {
    let frameId = 0;

    const updateScrollProgress = () => {
      frameId = 0;

      if (!heroRef.current) {
        return;
      }

      const { top, height } = heroRef.current.getBoundingClientRect();
      const scrollableDistance = Math.max(height - window.innerHeight, 1);
      const nextProgress = Math.min(Math.max(-top / scrollableDistance, 0), 1);

      setScrollProgress(nextProgress);
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateScrollProgress);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (sequenceFrames.length === 0) {
      return undefined;
    }

    const preloadSequence = async () => {
      await Promise.all(
        sequenceFrames.map(async (frameUrl) => {
          const loadedFrame = await preloadFrame(frameUrl);
          preloadedFramesRef.current.add(loadedFrame);
        }),
      );

      if (!isCancelled) {
        setVisibleFrame((currentFrame) => currentFrame ?? sequenceFrames[0]);
      }
    };

    preloadSequence();

    return () => {
      isCancelled = true;
    };
  }, []);

  const activeFrame = useMemo(() => {
    if (sequenceFrames.length === 0) {
      return heroImage;
    }

    const frameIndex = Math.min(
      sequenceFrames.length - 1,
      Math.floor(scrollProgress * (sequenceFrames.length - 1)),
    );

    return sequenceFrames[frameIndex];
  }, [scrollProgress]);

  useEffect(() => {
    let isCancelled = false;

    if (sequenceFrames.length === 0) {
      setVisibleFrame(heroImage);
      return undefined;
    }

    if (preloadedFramesRef.current.has(activeFrame)) {
      setVisibleFrame(activeFrame);
      return undefined;
    }

    preloadFrame(activeFrame).then((loadedFrame) => {
      preloadedFramesRef.current.add(loadedFrame);

      if (!isCancelled) {
        setVisibleFrame(loadedFrame);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeFrame]);

  const zoomProgress = Math.pow(scrollProgress, 0.55);
  const heroScale = 1 + zoomProgress * 6.8;
  const heroTranslateY = zoomProgress * -42;
  const textFadeProgress = Math.min(scrollProgress / 0.18, 1);
  const heroTextOpacity = 1 - textFadeProgress;
  const heroTextTranslateY = textFadeProgress * -24;
  const heroGradientOpacity = 1 - scrollProgress * 0.72;
  const coverageFadeProgress = Math.min(Math.max((scrollProgress - 0.66) / 0.14, 0), 1);
  const coverageTextTranslateY = (1 - coverageFadeProgress) * 18;
  const citiesEntryStart = 0.78;
  const citiesEntryStagger = 0.008;
  const citiesEntryDuration = 0.085;

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
            {HERO_OVERLAY_OPTIONS.showGradient ? (
              <div
                className="hero-gradient"
                style={{
                  opacity: heroGradientOpacity,
                }}
              />
            ) : null}
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
            {HERO_OVERLAY_OPTIONS.showText ? (
              <div
                className="hero-content-wrap"
                style={{
                  opacity: heroTextOpacity,
                  transform: `translate3d(0, ${heroTextTranslateY}px, 0)`,
                }}
              >
                <div className="hero-content">
                  <p className="eyebrow">New India Cargo</p>
                  <h1>Fast, reliable cargo movement with full-journey visibility.</h1>
                  <p className="hero-copy">
                    From first-mile pickup to final delivery, we help businesses move freight with
                    speed, confidence, and real-time coordination.
                  </p>
                  <div className="hero-actions">
                    <a className="primary-action" href="#services">
                      Explore services
                    </a>
                    <a className="secondary-action" href="#contact">
                      Request a callback
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
            ) : null}
            {HERO_OVERLAY_OPTIONS.showText ? (
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
                          className={`hero-partner-logo${partner.elevate ? ' hero-partner-logo-elevated' : ''}`}
                          src={partner.logo}
                        />
                      </div>
                      <span className="hero-partner-name">{partner.name}</span>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
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
                    (scrollProgress - (citiesEntryStart + index * citiesEntryStagger)) /
                      citiesEntryDuration,
                    0,
                  ),
                  1,
                );
                const cityEase = cityProgress * cityProgress;
                const cityOpacity = cityEase;
                const cityBlur = (1 - cityEase) * 14;
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
                      filter: `blur(${cityBlur}px)`,
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

      {/* <section className="info-section" id="services">
        <div>
          <p className="section-label">Services</p>
          <h2>Built for urgent freight and dependable logistics partnerships.</h2>
        </div>
        <div className="info-grid">
          <article>
            <h3>Express dispatch</h3>
            <p>Priority routing for time-sensitive cargo, documents, and business deliveries.</p>
          </article>
          <article>
            <h3>Warehousing support</h3>
            <p>Flexible storage and handling for scheduled outbound movement and consolidation.</p>
          </article>
          <article id="contact">
            <h3>Dedicated coordination</h3>
            <p>Single-point communication for quotes, tracking, and operational updates.</p>
          </article>
        </div>
      </section> */}
    </main>
  );
}

export default App;
