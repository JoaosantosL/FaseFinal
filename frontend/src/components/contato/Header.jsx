import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <>
      <h2 className={styles.title}>Entra em contacto connosco!</h2>
      <div className={styles.paragrafo_info}>
        <p className={styles.centeredText}>Estamos aqui para ajudar-te com qualquer dúvida ou questão que possas ter.
Preenche o formulário abaixo e entraremos em contacto contigo o mais rápido possível!e</p>
      </div>
    </>
  );
};

export default Header;