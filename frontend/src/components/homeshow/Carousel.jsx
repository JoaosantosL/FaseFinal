import React from 'react';
import styles from './Carousel.module.css';
import TrackItem from './TrackItem';
import PlaylistItem from './PlaylistItem';
import ArtistItem from './ArtistItem';

const Carousel = ({ title, id, type = 'tracks', items = [] }) => {
  const scrollCarousel = (direction) => {
    const carousel = document.getElementById(id);
    const scrollAmount = 220;
    carousel.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`${styles["vitrine-container"]} container`}>
      <div className={styles["carousel-container"]}>
        <h4>{title}</h4>

        <button 
          className={`${styles["carousel-button"]} ${styles["left"]}`} 
          onClick={() => scrollCarousel(-1)}
        >
          &#8249;
        </button>

        <div 
          className={styles["tracks-container"]}
          id={id}
        >
          {items.map((item, index) => {
            if (type === 'tracks') {
              return (
                <TrackItem 
                  key={`${id}-${index}`}
                  cover={item.cover}
                  title={item.title}
                  artist={item.artist}
                />
              );
            } else if (type === 'playlists') {
              return (
                <PlaylistItem 
                  key={`${id}-${index}`}
                  cover={item.cover}
                  name={item.name}
                />
              );
            } else if (type === 'artists') {
              return (
                <ArtistItem
                  key={`${id}-${index}`}
                  id={item._id}
                  name={item.name}
                  imageUrl={item.imageUrl}
                />
              );
            }
            return null;
          })}
        </div>

        <button 
          className={`${styles["carousel-button"]} ${styles["right"]}`} 
          onClick={() => scrollCarousel(1)}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default Carousel;