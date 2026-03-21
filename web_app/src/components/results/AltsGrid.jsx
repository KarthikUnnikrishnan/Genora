import React from 'react';
import styles from './AltsGrid.module.css';

export default function AltsGrid({ alternatives, selectedAlt, onSelect }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h3 className={styles.title}>Generic Alternatives</h3>
          <span className={styles.tag}>SAME SALT</span>
        </div>
        
        <div className={styles.sortBar}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button className={`${styles.sortBtn} ${styles.active}`}>Price ↑</button>
          <button className={styles.sortBtn}>Rating</button>
        </div>
      </div>

      <div className={styles.grid}>
        {alternatives.map((alt, idx) => {
          const isSelected = selectedAlt?.id === alt.id;
          
          return (
            <div 
              key={alt.id} 
              className={`${styles.card} ${alt.isBestPrice ? styles.bestPrice : ''} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(alt)}
            >
              {isSelected && <div className={styles.viewingBadge}>✓ VIEWING</div>}
              
              <div className={styles.cardHeader}>
                <span className={styles.index}>#{String(idx + 1).padStart(2, '0')}</span>
                <div className={styles.savings}>
                  Save ₹{alt.savings.toFixed(2)}
                </div>
              </div>
              
              <h4 className={styles.altName}>{alt.name}</h4>
              <p className={styles.manufacturer}>{alt.manufacturer}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.altForm}>{alt.form}</div>
                <div className={styles.altPrice}>₹{alt.price.toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
