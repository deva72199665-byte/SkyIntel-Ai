import React, { useEffect, useRef } from 'react';

export default function WeatherCanvas({ weatherType = 'rain', intensity = 0.6 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 400;
    };
    window.addEventListener('resize', handleResize);

    // Particle Generation
    const particleCount = Math.floor(120 * intensity);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 18 + 8,
        speedY: Math.random() * 8 + 4,
        speedX: Math.random() * 2 - 1,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 2 + 1,
      });
    }

    // Floating Clouds
    const clouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.4),
      radius: Math.random() * 40 + 30,
      speed: Math.random() * 0.3 + 0.1,
    }));

    let lightningTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Soft Cloud Shapes
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.radius > width) cloud.x = -cloud.radius;

        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 5, cloud.x, cloud.y, cloud.radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Rain or Wind Particles
      if (weatherType === 'rain' || weatherType === 'thunderstorm') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * width;
          }
        });
      } else if (weatherType === 'wind') {
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
        ctx.lineWidth = 1.2;

        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length * 2, p.y);
          ctx.stroke();

          p.x += p.speedY * 1.5;
          if (p.x > width) {
            p.x = -p.length * 2;
            p.y = Math.random() * height;
          }
        });
      }

      // Lightning Flash Trigger
      if (weatherType === 'thunderstorm') {
        lightningTimer++;
        if (lightningTimer % 180 === 0 && Math.random() < 0.6) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
          ctx.fillRect(0, 0, width, height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weatherType, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 rounded-2xl"
    />
  );
}
