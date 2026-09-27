import requests

base_url = "http://localhost:8005"

endpoints = [
    ("GET", "/"),
    ("GET", "/api/v1/surveillance/health"),
    ("GET", "/api/v1/surveillance/geocode?location=london"),
    ("GET", "/api/v1/surveillance/snapshot?location=london"),
    ("POST", "/api/v1/chat", {"json": {"messages": [{"role": "user", "content": "hello"}]}, "headers": {"X-API-Key": "dev-secret-key-123"}}),
    ("POST", "/api/v1/surveillance/analyze", {"json": {"location": "London", "time_horizon": "short"}}),
    ("POST", "/api/v1/surveillance/analyze/stream", {"json": {"location": "London", "time_horizon": "short"}, "stream": True}),
    ("POST", "/api/v1/surveillance/analyze_memory", {"json": {"location": "London", "time_horizon": "short"}}),
    ("POST", "/api/v1/distribution/plan", {"json": {"location": "London", "time_horizon": "short"}}),
    ("POST", "/api/v1/distribution/plan_memory", {"json": {"location": "London", "time_horizon": "short"}}),
    ("GET", "/api/v1/inventory/status"),
    ("POST", "/api/v1/alerts/trigger", {"json": {"region": "London"}}),
]

working = []
not_working = []

for method, path, *args in endpoints:
    url = base_url + path
    kwargs = args[0] if args else {}
    print(f"Testing {method} {url}...")
    try:
        if method == "GET":
            resp = requests.get(url, timeout=300, **kwargs)
        else:
            resp = requests.post(url, timeout=300, **kwargs)
        
        print(f" -> Result: {resp.status_code}")
        if resp.status_code < 400: # 2xx means endpoint is completely working
            working.append((method, path, resp.status_code))
        else:
            not_working.append((method, path, resp.status_code, resp.text[:150]))
    except Exception as e:
        print(f" -> Error: {e}")
        not_working.append((method, path, "Error", str(e)))

print("--- WORKING ENDPOINTS ---")
for w in working:
    print(w)

print("\n--- NOT WORKING ENDPOINTS ---")
for n in not_working:
    print(n)
