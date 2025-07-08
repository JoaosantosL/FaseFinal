import React from 'react';
import Question from './Question';
import Footer from './Footer';
import styles from './FAQPage.module.css';

const FAQPage = () => {
  const questions = [
    {
      id: 1,
      title: "Posso usar a app sem fazer LOGIN?",
      text: "Infelizmente a nossa aplicação é totalmente paga. No entanto fica a saber os beneficios de cada plano e escolhe um deles!"
    },
    {
      id: 2,
      title: "Esqueci-me dos meus dados de acesso?",
      text: "Vamos te ajudar, envia por favor um email para sounddream@gmail.com, e especifica o teu caso, se te lembrares de algum pequeno dado informa! Ao fim de analisar-mos iremos te responder e informar o estado do processo!"
    },
    {
      id: 3,
      title: "Quais são os planos disponíveis?",
      text: `Plano Normal: 3.99€<br><br> • Escuta música sem interrupções;<br> • Qualidade de aúdio Premium <br> • Acesso a todas as músicas <br> • Mais algumas vantagens!<br><br> Plano Premium: 9.99€<br><br> • Mantém os beneficios do plano Normal<br> • Divulga as tuas próprias músicas<br> •Estatísticas detalhadas sobre o desempenho das tuas músicas<br> • Sugere músicas ilimitadas<br><br>Este plano é ideal para pequenos artistas!`
    }
  ];

  return (
    <div className={styles["questions"]}>
      <div className={styles["title"]}>
        <h2>Questões Frequentes - FAQ</h2>
      </div>
      <div className={styles["section-center"]}>
        {questions.map((question) => (
          <Question 
            key={question.id}
            title={question.title}
            text={question.text}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;