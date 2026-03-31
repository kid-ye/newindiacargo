import { useEffect, useState, useRef, useMemo } from "react";

const sequenceFrames = Object.entries(
  import.meta.glob("../../assets/sequence_bg/*.webp", {
    eager: true,
    import: "default",
  }),
)
  .sort(([frameA], [frameB]) =>
    frameA.localeCompare(frameB, undefined, { numeric: true }),
  )
  .map(([, frameUrl]) => frameUrl);

const preloadFrame = (frameUrl) =>
  new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";

    const finish = () => resolve(frameUrl);

    image.onload = () => {
      if (typeof image.decode === "function") {
        image
          .decode()
          .catch(() => null)
          .finally(finish);
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

export function useScrollAnimation(heroImage) {
  const heroRef = useRef(null);
  const preloadedFramesRef = useRef(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleFrame, setVisibleFrame] = useState(
    sequenceFrames[0] ?? heroImage,
  );

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
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
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

    const frameIndex = Math.floor(scrollProgress * (sequenceFrames.length - 1));
    const targetFrameUrl = sequenceFrames[frameIndex];

    if (
      !preloadedFramesRef.current.has(targetFrameUrl) &&
      visibleFrame !== heroImage
    ) {
      return visibleFrame;
    }

    return targetFrameUrl;
  }, [scrollProgress, visibleFrame, heroImage]);

  useEffect(() => {
    setVisibleFrame(activeFrame);
  }, [activeFrame]);

  return { heroRef, visibleFrame, scrollProgress };
}
