import React from 'react';
import { FaEnvelope } from 'react-icons/fa';
import styles from './ContatoInfo.module.css';

const ContatoInfo = () => {
  return (
    <div className={styles.contatoInfo}>
      <h3>Informações:</h3>
      <p><FaEnvelope /> sounddream@gmail.com</p>
    </div>
  );
};

export default ContatoInfo;