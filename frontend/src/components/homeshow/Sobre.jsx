import React from 'react';
import { FaCheck } from 'react-icons/fa';
import styles from './Sobre.module.css';
import logo from '../../assets/images/logo.png';

const Sobre = () => {
  return (
    <section id="sobre" className={styles["sobre"]}>
      <div className={styles["container"]}>
        <div className={styles["sobre-image"]}>
          <img src={logo} alt="Sobre o aplicativo" />
        </div>
        <div className={styles["sobre-content"]}>
          <h2>Sobre o SoundDream</h2>
          <p>Aqui podes encontrar uma experiência musical sem interrupções, com artistas nacionais com maior visibilidade e muito mais.</p>
          <ul className={styles["sobre-list"]}>
            <li><FaCheck /> Mais de 5 artistas adicionados todos os dias</li>
            <li><FaCheck /> Qualidade de som premium</li>
            <li><FaCheck /> Disponível apenas online e em aplicação android</li>
            <li><FaCheck /> Foco em Artistas Nacionais</li>
            <li><FaCheck /> Parcerias com Editoras & Produtoras de Topo</li>
            <li><FaCheck /> E muito mais...</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Sobre;