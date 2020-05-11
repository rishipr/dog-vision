import os
from PIL import Image


def main():
    # iterate through the names of contents of the folder
    path = './images/'
    for image_path in os.listdir(path):
        input_path = os.path.join(path, image_path)
        if not input_path.endswith('.jpg'):
            continue

        img = Image.open(input_path).resize((210, 210), Image.ANTIALIAS)
        img.save(input_path)


if __name__ == '__main__':
    main()
