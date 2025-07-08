import React from 'react';
import styles from './PlaylistItem.module.css';

const PlaylistItem = ({ cover, name }) => {
  return (
    <div className={styles["playlist-item"]}>
      <div className={styles["playlist-cover"]}>
        {cover ? (
          <img src={cover} alt={name} />
        ) : (
          <div className={styles["placeholder"]}></div>
        )}
      </div>
      <h5 className={styles["playlist-name"]}>{name}</h5>
    </div>
  );
};

export default PlaylistItem;