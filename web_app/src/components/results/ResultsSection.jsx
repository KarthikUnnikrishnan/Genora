import React from 'react';
import styles from './ResultsSection.module.css';
import OriginalCard from './OriginalCard';
import AltsGrid from './AltsGrid';
import DetailPanel from './DetailPanel';

export default function ResultsSection({ results, selectedAlt, onSelectAlt }) {
  if (!results) return null;

  const original = results.original;
  const alternatives = results.alternatives;
  
  // The active medicine is the selected alt, or the original if nothing is selected
  const activeMedicine = selectedAlt || original;

  return (
    <section className={styles.container} id="results">
      <div className={styles.mainCol}>
        <OriginalCard medicine={original} />
        
        {alternatives && alternatives.length > 0 && (
          <AltsGrid 
            alternatives={alternatives} 
            selectedAlt={selectedAlt} 
            onSelect={onSelectAlt} 
          />
        )}
      </div>

      <div className={styles.sideCol}>
        <DetailPanel 
          medicine={activeMedicine} 
          isOriginal={!selectedAlt}
          reviews={results.reviews}
          interactionsList={results.interactionsList}
        />
      </div>
    </section>
  );
}
