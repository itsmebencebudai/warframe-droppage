export async function searchItems(query: string = '', page: number = 1, limit: number = 20) {
  console.log('Searching items with query:', query, 'page:', page, 'limit:', limit);
  try {
    const response = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

export async function loadAllItems() {
  console.log('Loading all items');
  try {
    const response = await fetch('http://localhost:5000/loadall');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error loading all items:', error);
    throw error;
  }
}