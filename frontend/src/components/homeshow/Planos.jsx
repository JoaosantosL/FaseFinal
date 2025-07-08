import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './Planos.module.css';

const Planos = () => {
  return (
    <section id="planos" className={styles["planos"]}>
      <div className={styles["container"]}>
        <h2>Os nossos Planos</h2>
        <div className={styles["planos-grid"]}>

          <div className={styles["plano"]}>
            <h3>Base</h3>
            <div className={styles["plano-preco"]}>3,99€ mês</div>
            <ul className={styles["plano-beneficios"]}>
              <li><FaCheck /> Acesso a todo o conteudo não-exclusivo de artistas</li>
              <li><FaCheck /> Suporte por e-mail</li>
            </ul>
            <Link to="/login" className={`${styles["btn"]} ${styles["btn-outline"]}`}>
              Subscrever
            </Link>
          </div>

          <div className={`${styles["plano"]} ${styles["destaque"]}`} >
            <h3>Para artistas</h3>
            <div className={styles["plano-preco"]}>9,99€ mês</div>
            <ul className={styles["plano-beneficios"]}>
              <li><FaCheck /> Todas as vantagens do Pro</li>
              <li><FaCheck /> Podes fazer upload de suas proprias musicas</li>
              <li><FaCheck /> Seja um artista oficial da plataforma SoundDream</li>
            </ul>
            <Link to="/login" className={`${styles["btn"]} ${styles["btn-outline"]}`}>
              Começar
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Planos;