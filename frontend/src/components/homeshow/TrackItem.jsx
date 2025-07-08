import React from 'react';
import styles from './TrackItem.module.css';

const TrackItem = ({ cover, title, artist, plays }) => {
  return (
    <div className={styles["track-item"]}>
      <div className={styles["track-cover"]}>
        {cover ? (
          <img 
            src={cover} 
            alt={`Capa de ${title}`} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/placeholder-cover.png'; // Fallback para imagem quebrada
            }}
          />
        ) : (
          <div className={styles["placeholder"]}>
            <span className="text-muted">Sem capa</span>
          </div>
        )}
      </div>
      <div className={styles["track-info"]}>
        <h5 className={styles["track-title"]} title={title}>
          {title}
        </h5>
        <p className={styles["track-artist"]}>{artist}</p>
        {plays && (
          <small className={styles["track-plays"]}>
            {plays.toLocaleString()} plays
          </small>
        )}
      </div>
    </div>
  );
};

export default TrackItem;