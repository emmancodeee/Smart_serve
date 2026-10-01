(() => {
  const rotator = document.getElementById("loginBgRotator");
  if (!rotator) return;

  const candidates = [
    "/images/login-bg.jpg",
    "/images/login-bg-2.jpg",
    "/images/login-bg-3.jpg"
  ];

  const preload = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });

  Promise.allSettled(candidates.map(preload)).then((results) => {
    const images = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (images.length === 0) return;

    const slideA = document.createElement("div");
    const slideB = document.createElement("div");
    slideA.className = "bg-slide active";
    slideB.className = "bg-slide";
    rotator.appendChild(slideA);
    rotator.appendChild(slideB);

    let activeSlide = slideA;
    let idleSlide = slideB;
    let index = 0;
    let direction = 1;

    const paint = (slide, src) => {
      slide.style.backgroundImage = `url("${src}")`;
    };

    paint(activeSlide, images[index]);

    if (images.length === 1) return;

    const rotate = () => {
      index = (index + 1) % images.length;
      direction *= -1;
      const enterClass = direction > 0 ? "enter-right" : "enter-left";
      const exitClass = direction > 0 ? "exit-left" : "exit-right";

      idleSlide.classList.remove("enter-right", "enter-left", "exit-left", "exit-right", "active");
      activeSlide.classList.remove("enter-right", "enter-left", "exit-left", "exit-right");

      paint(idleSlide, images[index]);
      idleSlide.classList.add(enterClass);

      // Force reflow so the browser applies start state before transition.
      void idleSlide.offsetWidth;

      idleSlide.classList.add("active");
      idleSlide.classList.remove(enterClass);
      activeSlide.classList.add(exitClass);
      activeSlide.classList.remove("active");

      setTimeout(() => {
        activeSlide.classList.remove(exitClass);
      }, 900);

      [activeSlide, idleSlide] = [idleSlide, activeSlide];
    };

    setInterval(rotate, 7000);
  });
})();
