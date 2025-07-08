import React, { useEffect } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  useEffect(() => {
    const footer = document.querySelector(`.${styles["footer"]}`);
    if (footer) {
      footer.addEventListener('mousemove', createParticle);
    }

    return () => {
      if (footer) {
        footer.removeEventListener('mousemove', createParticle);
      }
    };
  }, []);

  const createParticle = (event) => {
    const particle = document.createElement('div');
    particle.classList.add(styles["particle"]);

    const size = Math.random() * 10 + 5;
    const duration = Math.random() * 1 + 0.5;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${event.clientX - size / 2}px`;
    particle.style.top = `${event.clientY - size / 2}px`;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  };

  return (
    <footer className={styles["footer"]}>
      <div className={styles["container"]}>
        <div className={styles["footer-content"]}>
          <div className={styles["footer-logo"]}>
            <h1><span>SoundDream</span></h1>
            <p>Música a qualquer hora.</p>
          </div>
          <div className={styles["footer-links"]}>
            <h3>Links</h3>
            <ul>
              <li><a href="#sobre">Sobre</a></li>
              <li><a href="#funcionalidades">Funcionalidades</a></li>
              <li><a href="#planos">Planos</a></li>
              <li><a href="/FRONTEND/WebSiteGeral/P_Contacto/contacto.html">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className={styles["footer-bottom"]}>
          <p>&copy; 2025 SoundDream. Todos os direitos reservados - Escola Profissional Mariana Seixas</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;