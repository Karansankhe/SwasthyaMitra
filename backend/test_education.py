import requests
import json
import time

# Try to connect, if server is starting wait a bit
max_retries = 5
for i in range(max_retries):
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("Server is up!")
            break
    except requests.exceptions.ConnectionError:
        print(f"Waiting for server... ({i+1}/{max_retries})")
        time.sleep(2)

url = "http://localhost:8000/api/v1/education/generate"
payload = {
    "query": "Handling critical supply chain vulnerabilities and medicine stock-outs.",
    "user_role": "PHC Medical Officer"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Content:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error testing endpoint: {e}")
