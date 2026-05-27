import urllib.request
import json

url = "https://pinterest-1-5cxw.onrender.com/register"
data = json.dumps({
    "username": "testuser_api",
    "email": "testuser_api@example.com",
    "password": "password123"
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
