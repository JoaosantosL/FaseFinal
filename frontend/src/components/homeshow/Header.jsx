import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from './Header.module.css';
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);

  return (
    <header className={styles["header"]}>
      <div className={styles["container"]}>
        <h1 className={styles["logo"]}><span>SoundDream</span></h1>
        <nav className={`${styles["nav"]} ${menuActive ? styles["active"] : ''}`}>
          <ul>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#funcionalidades">Funcionalidades</a></li>
            <li><a href="#planos">Planos</a></li>
            <Link to="/faq" className={styles["unstyled-link"]}>
                <li>FAQ</li>
            </Link>
            <Link to="/contato" className={styles["unstyled-link"]}>
                <li>Contacto</li>
            </Link>
            <Link to="/login" className={styles["unstyled-link"]}>
                <li>Entrar</li>
            </Link>
          </ul>
        </nav>
        <button 
          className={styles["menu-mobile"]} 
          onClick={() => setMenuActive(!menuActive)}
          title="Abrir menu"
        >
          {menuActive ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
};

export default Header;