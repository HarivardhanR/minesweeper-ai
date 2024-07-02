import React, { useRef, useEffect } from "react";

const Confetti = () => {
  const canvasRef = useRef(null);
  const W = useRef(window.innerWidth);
  const H = useRef(window.innerHeight);
  const maxConfettis = 150;
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const possibleColors = [
      "#FF6347", // Tomato
      "#FFD700", // Gold
      "#00BFFF", // Deep Sky Blue
      "#FF69B4", // Hot Pink
      "#32CD32", // Lime Green
      "#BA55D3", // Medium Orchid
      "#FF8C00", // Dark Orange
      "#00CED1", // Dark Turquoise
      "#FF1493", // Deep Pink
      "#7B68EE", // Medium Slate Blue
      "#228B22", // Forest Green
      "#FFA500", // Orange
    ];

    function randomFromTo(from, to) {
      return Math.floor(Math.random() * (to - from + 1) + from);
    }

    function confettiParticle() {
      this.x = Math.random() * W.current;
      this.y = Math.random() * H.current - H.current;
      this.r = randomFromTo(11, 33);
      this.d = Math.random() * maxConfettis + 11;
      this.color =
        possibleColors[Math.floor(Math.random() * possibleColors.length)];
      this.tilt = Math.floor(Math.random() * 33) - 11;
      this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
      this.tiltAngle = 0;

      this.draw = function () {
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        context.stroke();
      };
    }

    function Draw() {
      context.clearRect(0, 0, W.current, H.current);

      for (let i = 0; i < maxConfettis; i++) {
        particles.current[i].draw();
      }

      let particle = {};
      for (let i = 0; i < maxConfettis; i++) {
        particle = particles.current[i];

        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
        particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

        if (
          particle.x > W.current + 30 ||
          particle.x < -30 ||
          particle.y > H.current
        ) {
          particle.x = Math.random() * W.current;
          particle.y = -30;
          particle.tilt = Math.floor(Math.random() * 10) - 20;
        }
      }

      requestAnimationFrame(Draw);
    }

    const resizeHandler = () => {
      W.current = window.innerWidth;
      H.current = window.innerHeight;
      canvas.width = W.current;
      canvas.height = H.current;
    };

    window.addEventListener("resize", resizeHandler);

    canvas.width = W.current;
    canvas.height = H.current;

    particles.current = [];
    for (let i = 0; i < maxConfettis; i++) {
      particles.current.push(new confettiParticle());
    }

    Draw();

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 1000,
        }}
      ></canvas>
    </>
  );
};

export default Confetti;
