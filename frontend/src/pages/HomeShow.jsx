import React, { useEffect, useState } from 'react';
import Header from '../components/homeshow/Header';
import Hero from '../components/homeshow/Hero';
import Carousel from '../components/homeshow/Carousel';
import Sobre from '../components/homeshow/Sobre';
import Funcionalidades from '../components/homeshow/Funcionalidades';
import Planos from '../components/homeshow/Planos';
import Footer from '../components/homeshow/Footer';
import styles from './HomeShow.module.css';
import api from '../services/axios';

const Home = () => {
  const [artists, setArtists] = useState({ pt: [], outros: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    api.get("/artists")
      .then((res) => {
        const all = res.data.data || [];
        const pt = all.filter((a) => a.isPortuguese);
        const outros = all.filter((a) => !a.isPortuguese);
        setArtists({ pt, outros });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar artistas:", err);
        setError("Erro ao carregar artistas. Por favor, recarregue a página.");
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.home}>
      <Header />
      <main>
        <Hero />
        <Sobre />
        <Funcionalidades />

        <section className={styles["carousel-section"]}>
          <div className="container">
            {!loading && !error && (
              <>
                {artists.pt.length > 0 && (
                  <>
                    <h4 className={styles["section-title"]}>Artistas Portugueses</h4>
                    <Carousel 
                      title="" 
                      id="artists-pt-carousel"
                      type="artists"
                      items={artists.pt}
                    />
                  </>
                )}
                
                {artists.outros.length > 0 && (
                  <>
                    <h4 className={styles["section-title"]}>Artistas Internacionais</h4>
                    <Carousel 
                      title="" 
                      id="artists-int-carousel"
                      type="artists"
                      items={artists.outros}
                    />
                  </>
                )}
              </>
            )}
            
            {error && (
              <div className="alert alert-danger text-center mt-4 fw-medium shadow-sm">
                {error}
              </div>
            )}
            
            {loading && (
              <div className="text-center text-muted mt-3 fst-italic">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                A carregar artistas...
              </div>
            )}
          </div>
        </section>

        <Planos />
      </main>
      <Footer />
    </div>
  );
};

export default Home;