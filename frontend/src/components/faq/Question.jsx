import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import styles from './Question.module.css';

const Question = ({ title, text }) => {
  const [showText, setShowText] = useState(false);

  return (
    <article className={`${styles["question"]} ${showText ? styles["show-text"] : ""}`}>
      <div className={styles["question-title"]}>
        <p>{title}</p>
        <button 
          type="button" 
          className={styles["question-btn"]}
          onClick={() => setShowText(!showText)}
          title="Toggle answer visibility"
        >
          <span className={styles["plus-icon"]}>
            <FontAwesomeIcon icon={faPlusSquare} />
          </span>
          <span className={styles["minus-icon"]}>
            <FontAwesomeIcon icon={faMinusSquare} />
          </span>
        </button>
      </div>
      <div className={styles["question-text"]}>
        <p dangerouslySetInnerHTML={{ __html: text }}></p>
      </div>
    </article>
  );
};

export default Question;