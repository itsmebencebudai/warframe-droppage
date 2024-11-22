
import requests

OLLAMA_API_URL = "http://localhost:11434/"
API_KEY = "e8ac7efa77b0502dd5918d7d50b207e5c982849c748c2a6e06acae5efbbb8f84" 

headers = {"Authorization": f"Bearer {API_KEY}"}
data = {"prompt": "Hello, Ollama!"}

response = requests.post(OLLAMA_API_URL, headers=headers, json=data)
if response.headers['Content-Type'] == 'application/json':
    try:
        data = response.json()
        print(data)
    except ValueError as e:
        print(f"JSON decoding failed: {e}")
else:
    print("The response is not JSON:", response.text)

