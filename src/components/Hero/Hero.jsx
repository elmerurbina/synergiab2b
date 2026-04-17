import React, { useEffect, useRef } from 'react';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import styles from './Hero.module.css';

const Hero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const setCanvasSize = () => {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    class Particle {
      constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 0.6;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Bounce off edges
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
          this.velocity.x = -this.velocity.x;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
          this.velocity.y = -this.velocity.y;
        }

        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      const colors = ['#1A73E8', '#2E7D32', '#7B1FA2', '#1E88E5', '#F57C00'];

      for (let i = 0; i < 50; i++) {
        const radius = Math.random() * 3 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const velocity = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5
        };

        particles.push(new Particle(x, y, radius, color, velocity));
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(26, 115, 232, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(232, 241, 253, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => particle.update());
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };

    setCanvasSize();
    initParticles();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const stats = [
    { number: '500+', label: 'Empresas' },
    { number: '2K+', label: 'Productos' },
    { number: '95%', label: 'Satisfacción' },
  ];

  const trustBadges = ['🏆', '⭐', '🔒', '🚀'];

  return (
    <section className={styles.hero}>
      <div className={styles.canvasBackground}>
        <canvas ref={canvasRef} className={styles.creativeCanvas} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <span className={styles.badge}>
            🚀 Plataforma B2B Líder en Nicaragua
          </span>

          <h1 className={styles.title}>
            Conecta tu negocio con{' '}
            <span className={styles.highlight}>oportunidades reales</span>
          </h1>

          <p className={styles.description}>
            Descubre proveedores, productos y servicios en un solo lugar.
            La plataforma inteligente que transforma la forma de hacer negocios en Nicaragua.
          </p>

          <div className={styles.searchForm}>
            <div className={styles.searchInput}>
              <Input
                type="search"
                placeholder="Buscar productos, servicios o proveedores..."
                size="large"
                iconLeft="🔍"
              />
            </div>
            <div className={styles.searchButton}>
              <Button variant="primary" size="large">
                Explorar
              </Button>
            </div>
          </div>

          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.trustBadges}>
            <span className={styles.trustText}>Confianza de empresas líderes</span>
            <div className={styles.badges}>
              {trustBadges.map((badge, index) => (
                <span key={index} className={styles.badgeIcon}>{badge}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.illustrationWrapper}>
            <svg
              className={styles.creativeSvg}
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Connection nodes network illustration */}
              <circle cx="200" cy="200" r="150" stroke="url(#gradient1)" strokeWidth="2" fill="none" strokeDasharray="5 5" opacity="0.3"/>
              <circle cx="200" cy="200" r="100" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" opacity="0.2"/>

              {/* Central hub */}
              <circle cx="200" cy="200" r="30" fill="url(#gradient1)" opacity="0.8">
                <animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="200" cy="200" r="15" fill="white" opacity="0.9" />

              {/* Connected nodes */}
              {[
                { cx: 100, cy: 100, color: "#1A73E8" },
                { cx: 300, cy: 100, color: "#2E7D32" },
                { cx: 100, cy: 300, color: "#7B1FA2" },
                { cx: 300, cy: 300, color: "#F57C00" },
                { cx: 150, cy: 50, color: "#1E88E5" },
                { cx: 250, cy: 50, color: "#66BB6A" },
                { cx: 50, cy: 200, color: "#AB47BC" },
                { cx: 350, cy: 200, color: "#6EA4F2" },
                { cx: 150, cy: 350, color: "#388E3C" },
                { cx: 250, cy: 350, color: "#CE93D8" },
              ].map((node, index) => (
                <g key={index}>
                  <circle cx={node.cx} cy={node.cy} r="12" fill={node.color} opacity="0.7">
                    <animate attributeName="r" values="12;16;12" dur={`${2 + index * 0.2}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={node.cx} cy={node.cy} r="5" fill="white" />
                  {/* Connection lines to center */}
                  <line x1={node.cx} y1={node.cy} x2="200" y2="200" stroke={node.color} strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite" />
                  </line>
                </g>
              ))}

              {/* Floating particles */}
              <circle cx="120" cy="150" r="3" fill="#1A73E8" opacity="0.6">
                <animate attributeName="cy" values="150;140;150" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="280" cy="250" r="3" fill="#2E7D32" opacity="0.6">
                <animate attributeName="cy" values="250;260;250" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="180" cy="280" r="2" fill="#7B1FA2" opacity="0.6">
                <animate attributeName="cx" values="180;190;180" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A73E8" />
                  <stop offset="100%" stopColor="#7B1FA2" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2E7D32" />
                  <stop offset="100%" stopColor="#F57C00" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating decorative elements */}
            <div className={`${styles.floatingElement} ${styles.element1}`} />
            <div className={`${styles.floatingElement} ${styles.element2}`} />
            <div className={`${styles.floatingElement} ${styles.element3}`} />
            <div className={`${styles.floatingElement} ${styles.element4}`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;