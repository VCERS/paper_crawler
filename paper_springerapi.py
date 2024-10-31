"""
You should do this steps in order ro run this code:
    * Use Search_Url_Finder.py to Download CSV file which contain url of each patent
    * Copy it (CSV file) to path where this code exist
    * Rename it to gp-search.csv

====Input: Sulfide Solid Electrolyte
Selenium Guide: How To Find Elements by CSS Selectors https://scrapeops.io/selenium-web-scraping-playbook/python-selenium-find-elements-css/
[20240906] Springer Nature API in Python, https://ualibweb.github.io/UALIB_ScholarlyAPI_Cookbook/src/python/springer.html
[] 

    
This code extract this information from Springer papers and store them into datafram:
    - ID
    - Description
    - Publication Date
    - URL
    
This code create two files in the code directory :
    patents_data.csv --> Contain all information scraped from patents pages
    not_scrap_pickle --> Contain all pantents from gp-search.csv which weren't scrapped 
    
@author: LIAO LONGLONG
"""


# Import required packages
import pandas as pd
import requests
import progressbar
import time, os, re
from os.path import join
from bs4 import BeautifulSoup
import pickle
from selenium.webdriver.common.by import By
from markdownify import MarkdownConverter   # Convert HTML to markdown, see https://github.com/AI4WA/Docs2KG
import strip_markdown, warnings

import requests
from time import sleep
from pprint import pprint
from key import api_key

script_path = os.path.dirname(os.path.abspath(__file__))
warnings.filterwarnings('ignore')

"""
Elsevier Developer Portal
--
Website URL: https://csip.fzu.edu.cn
Label: cers
Elsevier API Key: 35eea38f9f3911159f606a37c346d80e
"""

# from api_key import myAPIKey

def elsevier_api_crwal():
    myAPIKey = "35eea38f9f3911159f606a37c346d80e"
    # for xml download
    elsevier_url = "https://api.elsevier.com/content/article/doi/"

    "https://api.elsevier.com/content/search/sciencedirect"
    doi1 = '10.1016/j.tetlet.2017.07.080' # example Tetrahedron Letters article
    doi1 = "10.1016/j.joule.2024.07.012"

    fulltext1 = requests.get(elsevier_url + doi1 + "?APIKey=" + myAPIKey + "&httpAccept=text/xml")

    # save to file
    with open('fulltext1.txt', 'w') as outfile:
        outfile.write(fulltext1.text)

def springer_api_crwal(base_url, doi, query):
    response_flag = requests.get(f"{base_url}?q=doi:{doi} openaccess:true&api_key={api_key}")
    pprint(response_flag) # Response 200 means that the response was successful

    # Save to a file
    with open('fulltext.jats', 'w') as outfile:
        outfile.write(data.text)



def run_springer_api():
    base_url = 'https://api.springernature.com/openaccess/jats'

    # example DOI from SpringerOpen Brain Informatics
    doi = '"10.1007/s40708-014-0001-z"' # doi must be wrapped in double quotes




def springer_url_finder(query):
    # specify the base URL of the Springer page to scrape with the "STEM Education" query
    base_url = "https://link.springer.com/search/page/"
    query = '?query=STEM+Education&facet-content-type="Article"&facet-discipline="Education"&facet-sub-discipline="Science+Education"'

    # Initialize an empty list to collect data
    articles_data = []

    # Get the number of pages
    page = 1
    url = base_url + str(page) + query
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    last_page = soup.find("span", class_="number-of-pages")
    if last_page:
        last_page = int(last_page.text)
    else:
        last_page = 1  # If not found, default to 1

    # Loop through all pages
    for page in range(1, last_page + 1):
        print(page, "/", last_page)
        # Construct the URL for the current page
        url = base_url + str(page) + query
        # Make a GET request to the URL
        response = requests.get(url)
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, "html.parser")
        # Find the list of articles on the page
        article_list = soup.find("ol", class_="content-item-list")

        # Find all the individual article elements within the list
        if article_list:
            articles = article_list.find_all("li")
            for row in articles:
                titles = row.find_all("h2")
                p_tag = row.find("p", {"class": "content-type"})
                if p_tag is not None and "Article" in p_tag.text:
                    for title in titles:
                        href_value = title.a['href']
                        title_text = title.text.strip()
                        link_complete = "https://link.springer.com" + href_value
                        articles_data.append({"Titles": title_text, "Links": link_complete})
                        print(title_text, " ", link_complete)

    # Convert the list of dictionaries to a DataFrame
    df = pd.DataFrame(articles_data)
    # Save to CSV
    df.to_csv('STEM_Education_Articles.csv', index=False)
    print("Data saved to STEM_Education_Articles.csv")
    return df


def crawl_contect_webpage():
    # Make sure gp-search.csv exist  
    while not os.path.isfile(join(script_path, 'gp-search.csv')):
        print('\nYou should do this steps in order ro run this code:\n\t* Use Search_Url_Finder.py to Download CSV file which contain url of each patent\n\t* Copy it (CSV file) to path where this code exist\n\t* Rename it to gp-search.csv\n')
        print("\ngp-search.csv doesn't find. It should exist where this code exist\n")
        temp_ = input('\nPlease copy the file and  press Enter\n')
    # Import search-gp.csv as dataframe
    search_df = pd.read_csv(join(script_path, 'gp-search.csv'), skiprows=[0])


    # Load list of not scraped links if exist
    if os.path.isfile(join(script_path, 'not_scrap_pickle')):
        with open(join(script_path, 'not_scrap_pickle'), 'rb') as fp:
            not_scraped = pickle.load(fp)
    else:
        not_scraped = []

    # Set user agent for every request send to google    
    h = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0'}

    # Iteate over search-gp.csv and send request to server
    for (index, row), i in zip(search_df.iterrows(), progressbar.progressbar(range(len(search_df)))):
        link = row['result link']
        # Send request to Google Patents and scrap source of patent page
        # try except use in order handle connection errors
        try:
            r = requests.get(link, headers=h)
        except requests.exceptions.ConnectionError as e:
            not_scraped.append(link)
            print(e, '\n\n')
            # This piece closes the program if rate of errors go higher than 20% 
            if len(not_scraped) / int(index) >= 0.2:
                print('\nAbove half of request result in erroe please read the output to investigate why this happend\n')
                break
            continue
        # Use Beautidulsoup to extract information from html
        bs = BeautifulSoup(r.content, 'html.parser')

        # Extract description
        desc = bs.find('section', {'itemprop': 'description'})
        
        # Remove spaces before <i> or after </i> in the HTML content using regular expressions
        desc_str_no_spaces = re.sub(r'\s+(?=<i>)|(?<=</i>)\s+', '', str(desc))
        desc_str_no_spaces = re.sub(r'\s+(?=<sub>)|(?<=</sub>)\s+', '', desc_str_no_spaces)
        
        # desc_str = str(desc)
        # desc_str_no_spaces = desc_str.replace(' <i>', '<i>')

        # Create a new BeautifulSoup object from the modified HTML content
        desc = BeautifulSoup(desc_str_no_spaces, 'html.parser')
        with open("output.html", "w") as file:
            file.write(str(desc))

        # Create shorthand method for conversion
        def md(soup, **options):
            return MarkdownConverter(**options).convert_soup(soup)

        mdfile = join(script_path, "rstdir", row['id']+".md")
        with open(mdfile, "w", encoding='utf-8') as file:
            # file.write(md(desc, strong_em_symbol="", sub_symbol="~", sup_symbol="^"))
            markdown_content = md(desc, strong_em_symbol="", escape_misc=False)  # Convert HTML to markdown
            markdown_content = re.sub(r'\n\s*\n', '\n\n', str(markdown_content))   # Merge consecutive empty lines into a single empty line
            file.write(str(markdown_content))
            strip_markdown.strip_markdown_file(mdfile, join(script_path, "rstdir"))
            file.close()

        # Handle situation where description not exist
        if not desc is None:
            # Handle situation where description have non-english paragraphs
            if desc.find('span', class_='notranslate') is None:
                desc = desc.text.strip()
            else:
                notranslate = [tag.find(class_='google-src-text') for tag in desc.find_all('span', class_='notranslate')]
                for tag in notranslate:
                    tag.extract()
                desc = desc.text.strip()
        else:
            desc = 'Not Found'

