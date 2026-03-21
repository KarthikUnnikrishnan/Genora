import React from 'react';
import styles from './ModeSwitcher.module.css';

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div className={styles.switcher}>
      <button 
        className={`${styles.btn} ${mode === 'text' ? styles.active : ''}`}
        onClick={() => onChange('text')}
      >
        <span>🔍</span> Text Search
      </button>
      <button 
        className={`${styles.btn} ${mode === 'image' ? styles.active : ''}`}
        onClick={() => onChange('image')}
      >
        <span>📷</span> Image Scan
      </button>
    </div>
  );
}
