import React from 'react';
import styles from './Hero.module.css';
import principal from '../../assets/images/principal.png';

const Hero = () => {
  return (
    <section id="hero" className={styles["hero"]}>
      <div className={styles["container"]}>
        <div className={styles["hero-content"]}>
          <h2>Música a <span>qualquer hora!</span></h2>
          <p>Com uma qualidade de som incomparável. <br /> Playlists personalizadas. E muito mais.</p>
          <div className={styles["hero-buttons"]}>
            <a href="#planos" className={`${styles["btn"]} ${styles["btn-primary"]}`}>Ver Custos</a>
            <a href="#funcionalidades" className={`${styles["btn"]} ${styles["btn-secondary"]}`}>Saiba mais</a>
          </div>
        </div>
        <div className={styles["hero-banner"]}>
          <img src={principal} alt="Logotipo" />
        </div>
      </div>
    </section>
  );
};

export default Hero;