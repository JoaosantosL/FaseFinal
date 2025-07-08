import React from 'react';
import styles from './ArtistItem.module.css';
import { Link } from 'react-router-dom';

const ArtistItem = ({ id, name, imageUrl }) => {
  return (
    <div className={styles["artist-item"]}>
      <Link to={`/artist/${id}`} className={styles["artist-link"]}>
        <div className={styles["artist-cover"]}>
          {imageUrl ? (
            <img 
              src={`${process.env.REACT_APP_BACKEND_URL}${imageUrl}`} 
              alt={`${name}`}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = '/placeholder-artist.png';
              }}
            />
          ) : (
            <div className={styles["placeholder"]}>
              <span className={styles["placeholder-text"]}>{name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className={styles["artist-info"]}>
          <h5 className={styles["artist-name"]}>{name}</h5>
        </div>
      </Link>
    </div>
  );
};

export default ArtistItem;