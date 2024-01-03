import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def search(query):
    url = "https://google.serper.dev/search"
    serper_token = os.getenv("SERPER_API_KEY")
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

