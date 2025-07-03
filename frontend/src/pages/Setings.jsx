
import { useLocation } from 'react-router-dom';
import { FaUser, FaCreditCard } from 'react-icons/fa';
import styles from './Configuracoes.module.css';

const Configuracoes = () => {
  const location = useLocation();

  return (
    <div className={styles.container}>
      <ConfigCard>
        <Header />
        
        <div className={styles.content}>
          <Option
            to="/Conta"
            icon={FaUser}
            text="Conta"
            isActive={location.pathname === '/Conta'}
          />
          
          <Option
            to="/Planos"
            icon={FaCreditCard}
            text="Mudar de Plano"
            isActive={location.pathname === '/Planos'}
          />
        </div>
      </ConfigCard>
    </div>
  );
};

export default Configuracoes;