import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument("--headless")

BREEDS = ['golden retriever', 'yorkshire terrier',
          'german shepherd', 'corgi', 'husky', 'dalmatian', 'newfoundland']


def main():
    driver = webdriver.Chrome(
        executable_path="./chromedriver", options=chrome_options)
    base_url = "http://www.image-net.org/search?q="

    for b in BREEDS:
        # Get search results
        b = b.replace(' ', '+')
        full_url = f"{base_url}{b}"
        driver.get(full_url)

        # Navigate to synset page
        link = driver.find_element_by_partial_link_text('Synset:')
        link.click()

        # Get WNID for image set
        url = driver.current_url
        wnid = url.split("wnid=")[1]

        # Get txt data
        txt_url = f"http://www.image-net.org/api/text/imagenet.synset.geturls?wnid={wnid}"
        file_name = f"{b.replace('+','_')}.txt"

        download_txt(file_name, txt_url)


def download_txt(file_name, url):
    r = requests.get(url)
    data = r.text

    out_file = open(f'data/{file_name}', 'w')
    out_file.write(data)
    out_file.close()

    print(f"Finished downloading data for {file_name}")


if __name__ == '__main__':
    main()
