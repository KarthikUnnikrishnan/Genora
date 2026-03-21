import React from 'react';
import styles from './OriginalCard.module.css';

export default function OriginalCard({ medicine }) {
  if (!medicine) return null;

  return (
    <div className={styles.card}>
      <div className={styles.accentLine}></div>
      
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.tag}>SEARCHED MEDICINE</div>
          <h2 className={styles.name}>{medicine.name}</h2>
          <p className={styles.salt}>{medicine.salt}</p>
        </div>
        
        <div className={styles.right}>
          <div className={styles.price}>₹{medicine.price.toFixed(2)}</div>
          <div className={styles.formLabel}>per {medicine.form}</div>
        </div>
      </div>

      <div className={styles.chips}>
        <span className={styles.chip}>{medicine.form}</span>
        <span className={styles.chip}>{medicine.manufacturer}</span>
        <span className={styles.chip}>{medicine.category}</span>
        {medicine.available && (
          <span className={`${styles.chip} ${styles.available}`}>
            <span className={styles.dot}></span> Available
          </span>
        )}
        {medicine.interactions > 0 && (
          <span className={`${styles.chip} ${styles.warning}`}>
            ⚠️ {medicine.interactions} Interactions
          </span>
        )}
      </div>
    </div>
  );
}
