export async function searchItems(query: string = '') {
  console.log('Searching items with query:', query);
  const response = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(query)}`, {
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