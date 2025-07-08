import React from 'react';
import Header from '../components/contato/Header';
import ContatoLogo from '../components/contato/ContatoLogo';
import ContatoForm from '../components/contato/ContatoForm';
import ContatoInfo from '../components/contato/ContatoInfo';
import styles from './Contato.module.css';

const Contato = () => {
  return (
    <section id="contato" className={styles.contato}>
      <Header />
      <div className={styles.contatoGrid}>
        <ContatoLogo />
        <ContatoForm />
        <ContatoInfo />
      </div>
    </section>
  );
};

export default Contato;