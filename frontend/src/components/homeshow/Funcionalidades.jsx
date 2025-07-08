import React from 'react';
import { FaMusic, FaList, FaBell, FaBrain } from 'react-icons/fa';
import styles from './Funcionalidades.module.css';

const Funcionalidades = () => {
  return (
    <section id="funcionalidades" className={styles["funcionalidades"]}>
      <div className={styles["container"]}>
        <h2>Funcionalidades</h2>
        <div className={styles["features-grid"]}>
          <div className={styles["feature"]}>
            <div className={styles["feature-icon"]}>
              <FaMusic />
            </div>
            <h3>Streaming com alta qualidade</h3>
            <p>Ouve as tuas músicas favoritas em qualidade lossless.</p>
          </div>
          <div className={styles["feature"]}>
            <div className={styles["feature-icon"]}>
              <FaList />
            </div>
            <h3>Playlists personalizadas</h3>
            <p>Cria e armazena as tuas músicas para ouvires mais tarde.</p>
          </div>
          <div className={styles["feature"]}>
            <div className={styles["feature-icon"]}>
              <FaBell />
            </div>
            <h3>Novidades</h3>
            <p>Irás poder acompanhar todos os lançamentos recentes através das nossas notificações.</p>
          </div>
          <div className={styles["feature"]}>
            <div className={styles["feature-icon"]}>
              <FaBrain />
            </div>
            <h3>Recomendações inteligentes</h3>
            <p>Descobre novas músicas baseadas no teu gosto.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Funcionalidades;