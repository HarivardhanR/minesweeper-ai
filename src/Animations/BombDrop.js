import React, { useRef, useEffect } from "react";

const BombDrop = ({ numBombs }) => {
  const canvasRef = useRef(null);
  const W = useRef(window.innerWidth);
  const H = useRef(window.innerHeight);
  const bombs = useRef(
    Array.from({ length: numBombs }, (_, index) => ({
      x: Math.random() * W.current,
      y: -Math.random() * 200,
      size: 60,
      exploded: false,
    }))
  );
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const drawBomb = (bomb) => {
      context.font = `${bomb.size}px Arial`;
      context.fillText("\u{1F4A3}", bomb.x - bomb.size / 2, bomb.y);
    };

    const createParticles = (bomb) => {
      const particleCount = 100;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        particles.current.push({
          x: bomb.x,
          y: bomb.y,
          radius: Math.random() * 5 + 2,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          life: Math.random() * 30 + 30,
        });
      }
    };

    const drawParticles = () => {
      particles.current.forEach((particle, index) => {
        if (particle.life > 0) {
          context.beginPath();
          context.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2,
            false
          );
          context.fillStyle = particle.color;
          context.fill();
          context.closePath();

          particle.x += particle.dx;
          particle.y += particle.dy;
          particle.life--;
        } else {
          particles.current.splice(index, 1);
        }
      });
    };

    const animate = () => {
      context.clearRect(0, 0, W.current, H.current);

      bombs.current.forEach((bomb) => {
        if (bomb.y + bomb.size < H.current && !bomb.exploded) {
          bomb.y += 5; // speed of the bomb
          drawBomb(bomb);
        } else {
          if (!bomb.exploded) {
            bomb.exploded = true;
            createParticles(bomb);
          }
        }
      });

      drawParticles();

      requestAnimationFrame(animate);
    };

    const resizeHandler = () => {
      W.current = window.innerWidth;
      H.current = window.innerHeight;
      canvas.width = W.current;
      canvas.height = H.current;
    };

    window.addEventListener("resize", resizeHandler);

    canvas.width = W.current;
    canvas.height = H.current;

    animate();

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [numBombs]);

  return (
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
  );
};

export default BombDrop;
