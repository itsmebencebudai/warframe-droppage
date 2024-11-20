import React from 'react';

const relicStateMap: { [key: string]: string } = {
  "Intact": "(0 traces)",
  "Exceptional": "(25 traces)",
  "Flawless": "(50 traces)",
  "Radiant": "(100 traces)"
};

interface SourceCellProps {
  item: any;
}

export const SourceCell: React.FC<SourceCellProps> = ({ item }) => {
  if (item.tablename === "sortieRewards") {
    return <span>Sortie</span>;
  }

  if (item.tablename === "transientRewards" && item.objectiveName) {
    return <span>{item.objectiveName}</span>;
  }

  if (item.objectiveName || item.source || item.enemyName) {
    const source = item.objectiveName || item.source || item.enemyName;
    return (
      <a 
        href={`https://warframe.fandom.com/wiki/${source}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {source}
      </a>
    );
  }

  if (item.gameMode) {
    return (
      <span>
        ({item.planet}) {item.location}:
        <br />
        <a 
          href={`https://warframe.fandom.com/wiki/${item.gameMode}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {item.gameMode}
        </a>
      </span>
    );
  }

  if (item.relicName) {
    return (
      <span>
        <a 
          href={`https://warframe.fandom.com/wiki/${item.relicTier}_${item.relicName}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {item.relicTier} {item.relicName}
        </a>
        <span> </span>
        ({item.relicState} {relicStateMap[item.relicState] || "Unknown"})
      </span>
    );
  }

  if (item.keyName) return <span>{item.keyName}</span>;
  if (item.bountyLevel) return <span>{item.bountyLevel}</span>;
  if (item.syndicateName) return <span>{item.syndicateName} ({item.standing} standing)</span>;

  return <span className="text-center">-</span>;
};