export const getRotationValue = (rotation: string) => {
  if (rotation === 'A') return 1;
  if (rotation === 'B') return 2;
  if (rotation === 'C') return 3;
  return 0;
};

export const getRarityValue = (rarity: string) => {
  if (rarity === 'Common') return 1;
  if (rarity === 'Uncommon') return 2;
  if (rarity === 'Rare') return 3;
  if (rarity === 'Legendary') return 4;
  return 0;
};

export const removeCommasAndNumbers = (str: string) => {
  let A = '';
  let B = '';
  let C = '';
  const xIndex = str.indexOf('X');
  if (xIndex !== -1) {
    A = str.slice(0, xIndex).replace(/[^\d]/g, '').trim();
    B = str.slice(xIndex + 1).replace(/[^\d]/g, '').trim();
    if (B === '') B = '1';
    C = String(Number(A) * Number(B));
  } else {
    C = str.replace(/[^\d]/g, '').trim();
  }
  return str.replace('X', '').replace(',', '').replace(/[^a-zA-Z\s]/g, '').toLowerCase().trim() + (' ') + (C);
};

export const removeBountLevelAndPlanet = (bountyLevel: string) => {
  if (!bountyLevel) return 'Unknown Bounty';
  const cleanedBounty = bountyLevel.replace(/Level \d+ - \d+/g, '').trim();
  return cleanedBounty || 'Unknown Bounty';
};