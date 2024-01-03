from ..common.summarize import summary
from bs4 import BeautifulSoup
import requests
import json
import os

def scrape(url:str):
    # scrape website, and also will summarize the content based on objective if the content is too large
    # objective is the original objective & task that user give to the agent, url is the url of the website to be scraped

    print("Scraping website...")
    # Define the headers for the request
    headers = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
    }

    # Define the data to be sent in the request
    data = {
        "url": url
    }

    # Convert Python object to JSON string
    data_json = json.dumps(data)
    browerless_token = 'd35fbeec-aed5-462b-9719-a6e1e4ad57e2'
    # Send the POST request
    response = requests.post(
        f"https://chrome.browserless.io/content?token={browerless_token}", headers=headers, data=data_json)

    # Check the response status code
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        text = soup.get_text()
        print("CONTENTTTTTT:", text)
        if len(text) > 8000:
            output = summary(text)
            return output
        else:
            return text
    else:
        print(f"HTTP request failed with status code {response.status_code}")


# Run the function
# asyncio.run(scrape(url="https://daynghekimhoan.vn/mot-phan-vang-la-bao-nhieu-tien/"))

