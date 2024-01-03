import json
import requests
import os

def search(query):
    url = "https://google.serper.dev/search"
    serper_token = '559ff02d37e645503da07cdb805a5dc1a2d4a23b'
    payload = json.dumps({
        "q": query,
        "gl": "vn",
        "hl": "vi"
    })
    headers = {
        'X-API-KEY': serper_token,
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    return response.json()
