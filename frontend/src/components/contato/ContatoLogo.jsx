import React from 'react';
import styles from './ContatoLogo.module.css';
import principal from '../../assets/images/principal.png';

const ContatoLogo = () => {
  return (
    <div className={styles.logoBox}>
      <img 
        src={principal} 
        alt="SoundDream Logo"
        className={styles.logoImage}
      />
    </div>
  );
};

export default ContatoLogo;