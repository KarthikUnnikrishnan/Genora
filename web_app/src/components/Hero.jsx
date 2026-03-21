import React, { useState } from 'react';
import styles from './Hero.module.css';
import ModeSwitcher from './search/ModeSwitcher';
import TextSearch from './search/TextSearch';
import ImageSearch from './search/ImageSearch';

export default function Hero({ onSearch, loading }) {
  const [mode, setMode] = useState('text'); // text or image

  return (
    <section className={styles.hero}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
      
      <div className={styles.container}>
        <div className={`${styles.badge} fade-up`}>
          <div className={`${styles.badgeDot} blink`}></div>
          ✦ India's Generic Medicine Finder · 7,466 Medicines Indexed
        </div>

        <h1 className={`${styles.title} fade-up`}>
          Find the <span className={styles.italic}>cheaper alternative</span> instantly
        </h1>

        <p className={`${styles.subtitle} fade-up`}>
          Search by name, scan a strip, photograph a prescription or upload a tablet photo.
          Genora finds every generic alternative — ranked by price — in seconds.
        </p>

        <div className={`${styles.searchBox} fade-up`}>
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className={styles.searchInner}>
            {mode === 'text' ? (
              <TextSearch onSearch={onSearch} loading={loading} />
            ) : (
              <ImageSearch onSearch={onSearch} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
