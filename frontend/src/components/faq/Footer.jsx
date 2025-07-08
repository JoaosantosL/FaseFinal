import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles["footer"]}>
      <p>A equipa da <span className={styles["ciano"]}>SoundDream</span> espera te conseguir ajudar!</p>
    </footer>
  );
};

export default Footer;