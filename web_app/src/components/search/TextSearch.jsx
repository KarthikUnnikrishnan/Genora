import React, { useState } from 'react';
import styles from './TextSearch.module.css';

const SUGGESTIONS = [
  'Paracetamol 500mg', 'Azithromycin 500', 
  'Metformin 500', 'Pantoprazole 40mg', 'Amoxicillin 250'
];

export default function TextSearch({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (sug) => {
    setQuery(sug);
    onSearch(sug);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter medicine name or salt..." 
          className={styles.input}
          autoComplete="off"
        />
        <button 
          type="submit" 
          className={styles.searchBtn}
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search →'}
        </button>
      </form>
      
      <div className={styles.suggestions}>
        <span className={styles.sugLabel}>Trending:</span>
        <div className={styles.pills}>
          {SUGGESTIONS.map((sug, i) => (
            <button 
              key={i} 
              type="button" 
              className={styles.pill}
              onClick={() => handleSuggestionClick(sug)}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
