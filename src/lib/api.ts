export async function searchItems(query: string = '', page: number = 1, limit: number = 20) {
  console.log('Searching items with query:', query, 'page:', page, 'limit:', limit);
  const response = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
    
  if (!response.ok) {
    console.error('Server response not ok:', response.status, response.statusText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}

export async function loadAllItems() {
  console.log('Loading all items');
  const response = await fetch('http://localhost:5000/loadall', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
    
  if (!response.ok) {
    console.error('Server response not ok:', response.status, response.statusText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}