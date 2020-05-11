import os
from PIL import Image
import progressbar
import requests
import shutil
import urllib.request
from scraper import BREEDS


num_downloaded = 0


def main():
    for b in BREEDS:
        global num_downloaded
        num_downloaded = 0

        print(f"Downloading images for {b} breed...")
        bar = progressbar.ProgressBar(max_value=300)
        bar.update(0)

        file_path = f"data/{b.replace(' ', '_')}.txt"
        in_file = open(file_path, 'r')

        lines = in_file.readlines()
        for l in lines:
            if (num_downloaded == 300):
                break

            l = l.replace("\n", "").lower()
            b = b.replace(' ', '')

            # Skip if not an image file
            if not l.endswith('.jpg'):
                continue

            try:
                download_image(b, l)
                bar.update(num_downloaded)
            except:
                continue

        bar.update(300)
        print("\n")
        in_file.close()


def download_image(breed, url):
    global num_downloaded

    # Check url
    try:
        r = requests.get(url, timeout=1)
        r.raise_for_status()
    except:
        pass

    if r.status_code == 200:
        # Save image
        output_name = f"images/{breed}-{num_downloaded}.jpg"
        urllib.request.urlretrieve(url, output_name)

        # Check to see if image is valid
        if not check_validity(output_name):
            # If corrupted image, delete image and exit function
            if os.path.exists(output_name):
                os.remove(output_name)

            return

        num_downloaded += 1

    else:
        raise Exception('Bad url...')


def check_validity(img_name):
    try:
        img = Image.open(img_name)
        img.verify()

        return True
    except (IOError, SyntaxError):
        return False


if __name__ == '__main__':
    if os.path.exists("images/"):
        shutil.rmtree('./images', ignore_errors=True)
        os.mkdir("./images")
    else:
        os.mkdir("./images")

    main()
