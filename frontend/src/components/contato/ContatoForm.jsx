import React, { useState } from 'react';
import Button from './Button';
import styles from './ContatoForm.module.css';

const ContatoForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form className={styles.contatoForm} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <textarea
        placeholder="Mensagem"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        required
      />
      <Button type="submit">ENVIAR PEDIDO</Button>
    </form>
  );
};

export default ContatoForm;