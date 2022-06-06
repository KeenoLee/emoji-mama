#Import libraries (Don't change)
from GoogleImageScrapper import GoogleImageScraper
import os
from patch import webdriver_executable

#Define file path (Don't change)
webdriver_path = os.path.normpath(os.path.join(os.getcwd(), 'webdriver', webdriver_executable()))
image_path = os.path.normpath(os.path.join(os.getcwd(), 'photos'))

#Add new search key into array ["cat","t-shirt","apple","orange","pear","fish"]
search_keys= ["cat","t-shirt"]

#Parameters
number_of_images = 10
headless = True
min_resolution=(0,0)
max_resolution=(1920,1080)

#Main program
for search_key in search_keys:
    image_scrapper = GoogleImageScraper(webdriver_path,image_path,search_key,number_of_images,headless,min_resolution,max_resolution)
    image_urls = image_scrapper.find_image_urls()
    image_scrapper.save_images(image_urls)
