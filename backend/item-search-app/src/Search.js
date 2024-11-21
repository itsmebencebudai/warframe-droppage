import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from "react-spinners";

function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const observer = React.useRef();
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [hasMore, setHasMore] = useState(true);

    const handleSearch = async (event, append = false) => {
        if (event) event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:5000/search', {
                params: { query, page, limit },
            });

            setResults((prevResults) => append ? [...prevResults, ...response.data] : response.data);

            if (response.data.length < limit) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error during search:', error);
            setError('There was an error with your search. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!observer.current) return;

        const handleObserver = ([entry]) => {
            if (entry.isIntersecting && hasMore && !loading) {
                setPage((prevPage) => prevPage + 1);
            }
        };

        const io = new IntersectionObserver(handleObserver, { threshold: 1.0 });
        observer.current && io.observe(observer.current);

        return () => io.disconnect();
    }, [loading, hasMore]);

    const handleSort = (column) => {
        setSortColumn(column);
        setSortOrder((prevOrder) => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedResults = [...results].map((itemObj) => {
        if (itemObj.results) {
            return itemObj.results.map((item) => ({
                ...item,
                parentData: itemObj,
            }));
        }
        return itemObj;
    }).flat();

    const getRotationValue = (rotation) => {
        if (rotation === 'A') return 1;
        if (rotation === 'B') return 2;
        if (rotation === 'C') return 3;
        return 0;
    };

    const getRarityValue = (rarity) => {
        if (rarity === 'Common') return 1;
        if (rarity === 'Uncommon') return 2;
        if (rarity === 'Rare') return 3;
        if (rarity === 'Legendary') return 4;
        return 0;
    };

    const removeCommasAndNumbers = (str) => {
        let A = '';
        let B = '';
        let C = '';
        const xIndex = str.indexOf('X');
        if (xIndex !== -1) {
            A = str.slice(0, xIndex).replace(/[^\d]/g, '').trim();
            B = str.slice(xIndex + 1).replace(/[^\d]/g, '').trim();
            if (B === '') B = 1;
            C = A * B;
        } else {
            C = str.replace(/[^\d]/g, '').trim();
        }
        return str.replace('X', '').replace(',', '').replace(/[^a-zA-Z\s]/g, '').toLowerCase().trim() + (' ') + (C);
    };

    const removeBountLevelAndPlanet = (bountyLevel) => {
        if (!bountyLevel) return 'Unknown Bounty';
        const cleanedBounty = bountyLevel.replace(/Level \d+ - \d+/g, '').trim();
        return cleanedBounty || 'Unknown Bounty';
    };


    if (sortColumn) {
        sortedResults.sort((a, b) => {
            const valA = a[sortColumn] || '';
            const valB = b[sortColumn] || '';

            switch (sortColumn) {
                case 'chance': {
                    const chanceA = parseFloat(valA.replace('%', '')) || 0;
                    const chanceB = parseFloat(valB.replace('%', '')) || 0;
                    return sortOrder === 'asc' ? chanceA - chanceB : chanceB - chanceA;
                }

                case 'rotation': {
                    const rotationA = getRotationValue(valA);
                    const rotationB = getRotationValue(valB);
                    return sortOrder === 'asc' ? rotationA - rotationB : rotationB - rotationA;
                }

                case 'rarity': {
                    const rarityA = getRarityValue(valA);
                    const rarityB = getRarityValue(valB);
                    return sortOrder === 'asc' ? rarityA - rarityB : rarityB - rarityA;
                }

                case 'source': {
                    const sourceA = removeBountLevelAndPlanet(valA);
                    const sourceB = removeBountLevelAndPlanet(valB);
                    if (sourceA < sourceB) return sortOrder === 'asc' ? -1 : 1;
                    if (sourceA > sourceB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }

                case 'itemName': {
                    const itemNameA = removeCommasAndNumbers(valA);
                    const itemNameB = removeCommasAndNumbers(valB);
                    if (itemNameA < itemNameB) return sortOrder === 'asc' ? -1 : 1;
                    if (itemNameA > itemNameB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }

                default: {
                    if (typeof valA === 'number' && typeof valB === 'number') {
                        return sortOrder === 'asc' ? valA - valB : valB - valA;
                    }
                    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
            }
        });
    }

    const loadAllItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/loadall')
            setResults(response.data)
        } catch (error) {
            console.error('Error during load all:', error)
            setError('Failed to load items. Please try again later.')
        }
    };

    useEffect(() => {
        window.onload = () => {
            loadAllItems();
            handleSort('itemName', 'desc');
            handleSort('itemName', 'asc');
        };
        return () => {
            window.onload = null;
        };
    }, []);

    return (
        <div>
            <h1>Search for Items</h1>
            <form onSubmit={handleSearch}>
                <div>
                    <input
                        type="text"
                        placeholder="Search for an item by name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ width: '500px' }}
                        onKeyDownCapture={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                    />
                    <button type="submit">Search</button>
                </div>
            </form>

            {loading && <ClipLoader size={50} color="#36d7b7" />}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Results</h2>
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '200px' }}>
                            <button onClick={() => handleSort('itemName')}>
                                Item Name {sortColumn === 'itemName' && (sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↔')}
                            </button>
                        </th>
                        <th style={{ width: '150px' }}>
                            <button onClick={() => handleSort('rarity')}>
                                Rarity {sortColumn === 'rarity' && (sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↔')}
                            </button>
                        </th>
                        <th style={{ width: '100px' }}>
                            <button onClick={() => handleSort('chance')}>
                                Chance {sortColumn === 'chance' && (sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↔')}
                            </button>
                        </th>
                        <th style={{ width: '200px' }}>
                            <button onClick={() => handleSort('source')}>
                                Source {sortColumn === 'source' && (sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↔')}
                            </button>
                        </th>
                        <th style={{ width: '100px' }}>
                            <button onClick={() => handleSort('rotation')}>
                                Rotation {sortColumn === 'rotation' && (sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↔')}
                            </button>
                        </th>
                        <th style={{ width: '100px' }}>
                            <button onClick={() => handleSort('stage')}>
                                Stage {sortColumn === 'stage' && (sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↔')}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedResults.map((item, index) => {
                        const uniqueKey = `${item.id || item.itemName || 'unknown'}-${index}`;
                        return (
                            <tr uniquekey={uniqueKey}
                                key={uniqueKey}>
                                <td itemname={removeCommasAndNumbers(item.itemName)}
                                    data-processed-item-name={item.processedItemName}>
                                    {item.itemName}
                                </td>
                                <td rarity={item.rarity}>
                                    {item.rarity || 'N/A'}
                                </td>
                                <td enemymoddropchance={item.enemyModDropChance}
                                    chance={item.chance}
                                    style={{ minWidth: '50px' }}>
                                    {`${item.enemyModDropChance || item.chance} %`}
                                </td>
                                <td tablename={item.tablename}
                                    objectivename={item.objectiveName}
                                    source={item.source}
                                    enemyname={item.enemyName}
                                    gamemode={item.gameMode}
                                    relicname={item.relicName}
                                    keyname={item.keyName}
                                    bountylevel={item.bountyLevel}
                                    syndicatename={item.syndicateName}
                                    standing={item.standing}
                                    rotation={item.rotation}
                                    stage={item.stage}
                                    data-processed-source={item.processedSource}>
                                    {item.tablename === "sortieRewards" ? <span>Sortie</span> :
                                        item.tablename === "transientRewards" ? item.objectiveName :
                                            item.objectiveName || item.source || item.enemyName ? (
                                                <a href={`https://warframe.fandom.com/wiki/${item.objectiveName || item.source || item.enemyName}`} target="_blank" rel="noopener noreferrer">
                                                    {item.objectiveName || item.source || item.enemyName}
                                                </a>
                                            ) : item.gameMode ? (
                                                <span>
                                                    ({item.planet}) {item.location}:
                                                    <br />
                                                    <a href={`https://warframe.fandom.com/wiki/${item.gameMode}`} target="_blank" rel="noopener noreferrer">
                                                        {item.gameMode}
                                                    </a>
                                                </span>
                                            ) : item.relicName ? (
                                                <span>
                                                    <a href={`https://warframe.fandom.com/wiki/${item.relicTier}_${item.relicName}`} target="_blank" rel="noopener noreferrer">
                                                        {item.relicTier} {item.relicName}
                                                    </a>
                                                    <span> </span>({item.relicState} {({
                                                        "Intact": "(0 traces)",
                                                        "Exceptional": "(25 traces)",
                                                        "Flawless": "(50 traces)",
                                                        "Radiant": "(100 traces)"
                                                    })[item.relicState] || "Unknown"})
                                                </span>
                                            ) : (
                                                item.keyName ||
                                                item.bountyLevel ||
                                                `${item.syndicateName} (${item.standing} standing)` ||
                                                '-'
                                            )
                                    }
                                </td>
                                <td rotation={item.rotation}>
                                    {item.rotation ? `Rotation ${item.rotation}` : '-'}
                                </td>
                                <td stage={item.stage}>
                                    {item.stage ? `${item.stage}` : '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div ref={observer}></div>
            {loading && <ClipLoader size={30} color="#36d7b7" />}
            {!hasMore && <p>No more items to load</p>}
        </div >
    );
}
export default Search;