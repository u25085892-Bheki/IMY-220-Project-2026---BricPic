import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function SplashPage() {
  const buildImages = [
    { src: "/legoBuild1.jpg", alt: "Lego Church Build", title: "Church" },
    { src: "/legoBuild2.jpg", alt: "Lego Space Jet", title: "Space Jet" },
    { src: "/legoBuild3.jpg", alt: "Lego Rainbow Build", title: "Rainbow" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + buildImages.length) % buildImages.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % buildImages.length);
  };

  // Optional subtle auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % buildImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [buildImages.length]);

  return (
    <div className="splash-container">
      <img
        src="/SplashPageBackground.png"
        alt="BricPic Splash Banner with Lego Minifigures"
        className="splash-background-img"
      />

      {/* Wireframe 4: Centered white rounded container with thick red border */}
      <section className="splash-center-card" aria-label="Welcome to BricPic">
        <div className="splash-carousel-wrapper">
          <button
            type="button"
            className="splash-carousel-arrow-btn"
            id="splash-slide-prev"
            onClick={handlePrev}
            aria-label="Previous build photo"
          >
            <img src="/Arrow left-circle.svg" alt="Previous" />
          </button>

          <div className="splash-carousel-viewport">
            <div
              className="splash-carousel-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {buildImages.map((item, idx) => (
                <div key={idx} className="splash-slide-item">
                  <img src={item.src} alt={item.alt} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="splash-carousel-arrow-btn"
            id="splash-slide-next"
            onClick={handleNext}
            aria-label="Next build photo"
          >
            <img src="/Arrow right-circle.svg" alt="Next" />
          </button>
        </div>

        {/* Wireframe 4: Two rounded pill buttons: yellow LOGIN and blue SIGN UP */}
        <div className="splash-action-buttons">
          <Link to="/login" className="btn-splash-pill btn-splash-login" id="splash-login-btn">
            LOGIN
          </Link>
          <Link to="/signup" className="btn-splash-pill btn-splash-signup" id="splash-signup-btn">
            SIGN UP
          </Link>
        </div>
      </section>
    </div>
  );
}

export default SplashPage;

