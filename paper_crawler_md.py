"""
You should do this steps in order ro run this code:
    * Use Search_Url_Finder.py to Download CSV file which contain url of each patent
    * Copy it (CSV file) to path where this code exist
    * Rename it to gp-search.csv

====Input: Sulfide Solid Electrolyte
Selenium Guide: How To Find Elements by CSS Selectors https://scrapeops.io/selenium-web-scraping-playbook/python-selenium-find-elements-css/
[python libs] https://ualibweb.github.io/UALIB_ScholarlyAPI_Cookbook/src/python/sdirect.html
    
This code extract this information from patents page from Google Patents and store them into datafram:
    - ID
    - Description
    - Publication Date
    - URL
    

This code create two files in the code directory :
    patents_data.csv --> Contain all information scraped from patents pages
    not_scrap_pickle --> Contain all pantents from gp-search.csv which weren't scrapped 



====Libraries used:
[] https://pypi.org/project/markdown2/
[] https://github.com/PaperTurtle/python_html_markdown_converter
[] https://pypi.org/project/markdownify/

@author: LIAO LONGLONG
"""


# Import required packages
import pandas as pd
import progressbar
import time, os, re
from os.path import join
from bs4 import BeautifulSoup
import pickle
from selenium.webdriver.common.by import By
import markdownify, glob
from markdownify import MarkdownConverter   # Convert HTML to markdown, see https://github.com/AI4WA/Docs2KG
import strip_markdown

from neomodel import StructuredNode, StringProperty, ArrayProperty, DateTimeProperty
from doi2bibtex.resolve import resolve_doi

import json, warnings
import requests
from time import sleep

script_path = os.path.dirname(os.path.abspath(__file__))
warnings.filterwarnings('ignore')

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


def get_mate_item(bs, attrs_value='dc.title'):
    # Find the meta tag with name "dc.title"
    meta_tag = bs.find('meta', attrs={'name': attrs_value})
    # Extract the content attribute
    item_content = ""
    if meta_tag and 'content' in meta_tag.attrs:
        item_content = meta_tag['content']            

    return item_content


class Reference(StructuredNode):
    nodeid = StringProperty(unique_index=True, required=True)
    title = StringProperty(required=True)
    type = StringProperty()     # Journal, Conference, Thesis, Report, etc
    authors = ArrayProperty(required=True, base_property=StringProperty())
    affiliations = ArrayProperty(required=True, base_property=StringProperty())
    doi = StringProperty()
    url = StringProperty()           # URL of the source
    published_name = StringProperty()   # Journal/Conference name
    published_date = DateTimeProperty()   # Date of publication


# Extract bibtex information from the HTML file, using https://github.com/timothygebhard/doi2bibtex
def get_bib_doi(bs, store_dir, cls_name='Reference', contain_affiliation=False):
    # Extract the publisher information
    if contain_affiliation:
        pulisher = bs.find('meta', attrs={'property': 'og:site_name'})
        author_affiliations = []
        if pulisher['content'] in ['Wiley Online Library', 'Nature']:
            meta_tags = ['citation_author', 'citation_author_institution']        
            meta_authors = bs.find_all('meta', attrs={'name': meta_tags[0]})
            meta_affiliations = bs.find_all('meta', attrs={'name': meta_tags[1]})
            # Iterate through each meta tag and print the content
            for index, meta_author_tag in enumerate(meta_authors):
                print(f"Meta tag {index} content: {meta_author_tag['content']}")
                author_affiliations.append({meta_author_tag['content']: meta_affiliations[index]['content']})
        elif pulisher['content'] in ["ACS Publications"]:
            meta_tags = ['og:title', "og:type", 'og:url', "publication_doi"]
        else:
            meta_tags = ['og:title', "og:type", 'og:url', 'publication_doi']

        print("=========", author_affiliations)

    paper_title = bs.find('meta', attrs={'property': 'og:title'})['content']    
    paper_title = re.sub(r'/', '', paper_title)

    # Get DOI from the meta tags in the HTML file
    meta_doi_tags = ["dc.identifier", "publication_doi", "citation_doi", "prism.doi"]
    for meta_tag in meta_doi_tags:
        meta_doi = bs.find('meta', attrs={'name': meta_tag})
        if meta_doi is not None: 
            meta_doi = meta_doi['content']
            break
    
    
    # Resolve the DOI to get the bibtex information    
    doi_pattern = r'^10\.\d{4,9}/[-._;()/:A-Z0-9]+$'
    meta_doi = re.sub(r'doi:', '', meta_doi)  # Remove any slashes in the DOI as Nature articles have slashes in the DOI
    if re.match(doi_pattern, meta_doi, re.IGNORECASE) is not None:  # Check if the DOI is valid
        bib_info = resolve_doi(meta_doi) 

    # Extract the reference attribute
    properties = {}  # Extract key information
    node_reference = globals()[cls_name]
    for att_array in node_reference.__all_properties__: 
        attr = att_array[0]
        if attr == "type":
            properties[attr] = bib_info.get('ENTRYTYPE')
        elif attr == "authors":
            # Split the string on " and "
            authors_list = bib_info.get('author').split(" and ")
            # Clean up each part and format the output
            properties[attr] = [author.replace(',', '').strip() for author in authors_list]
            print(properties[attr])
        elif attr == "affiliations":
            properties[attr] = bib_info.get('citation_author_institution')
        elif attr == "published_name":
            properties[attr] = bib_info.get('journal')
        elif attr == "doi":               
            properties[attr] = meta_doi
        elif attr == "published_date":
            properties[attr] = bib_info.get('year')
        elif attr == "title":
            properties[attr] = paper_title
        else:
            properties[attr] = bib_info.get(attr)

    print(properties)
     # Create the JSON template
    json_bib = {node_reference.__name__: {"properties": properties,}}    
    json_bibcontent = json.dumps(json_bib, indent=4, ensure_ascii=False)
    print(json_bibcontent)
    # Write to a JSON file
    json_name = re.sub(r'/', '_', meta_doi)
    bib2json_path = join(script_path, store_dir, json_name + ".json")
    with open(bib2json_path, 'w', encoding='utf-8') as json_file:
        json_file.write(json_bibcontent)    

    return "DOI: " + meta_doi, paper_title


def html2text(html):


    return text


# Extract the content of the articles published in the journal "Advanced Energy Materials", 'Advanced Materials'
def extract_artical(html_file_path="", md_path='rstdir'):
    # Read the HTML file
    with open(html_file_path, "r") as file:
        html = file.read()
    # Use Beautidulsoup to extract information from html
    bs = BeautifulSoup(html, 'html.parser')
    print("Extracting data from", html_file_path)

    artical_doi, artical_title = get_bib_doi(bs, md_path)

# Extract description
    pulisher = bs.find('meta', attrs={'property': 'og:site_name'})['content']    
    if pulisher in ['Wiley Online Library']:
        desc_arr = bs.find_all('section', class_=['article-section__content'])
    elif pulisher in ['Science']:
        desc_arr = bs.find_all('div', attrs={'class': 'core-container'})
        # desc_arr = bs.find_all('div', attrs={'role': 'paragraph'})
    elif pulisher in ["Nature"]:   
        desc_arr = bs.find_all('div', class_=['main-content'])   #Nature        
    elif pulisher in ["ACS Publications"]:
        desc_arr = bs.find_all('div', class_=['article_content-left'])
    else:
        desc_arr = []
        print("No content class found for the artical titled", artical_title)
   
    artical_date = artical_doi        
    for desc in desc_arr:
        # Remove all <img> tags and their content
        remove_tags = ['img', 'ol','button']
        for rm_tag in remove_tags:
            for dese_tag in desc.find_all(rm_tag):            
                dese_tag.replace_with(" ")

        # Find the div with the specific class and remove its contents
        remove_divs = ['loa-wrapper loa-authors hidden-xs desktop-authors', 'authorInformationSection', 'article__copy', 'ack']
        for rm_div in remove_divs:
            for dese_div in desc.find_all('div', class_=rm_div): 
                # print(dese_div.get('class'), "----", dese_div.text)           
                dese_div.replace_with(" ")

        for div_pra in desc.find_all('div', class_=['NLM_p']):
            div_pra.insert_before(bs.new_tag('br'))
            # tmp = bs.new_tag('p')
            # tmp.append(div_pra)
            # div_pra = tmp            

        extract_tags =  ['sub', 'i', 'sup']
        for ext_tag in extract_tags:
            for a_tag in desc.find_all(ext_tag):               
                a_tag.replace_with(a_tag.text)

        for a_tag in desc.find_all('a'):            
            if a_tag.get('class') is not None:
                if a_tag.get('class')[0] in ['open-in-viewer', 'suppLink', 'ext-link', 'internalNav']:                    
                    a_tag.replace_with(a_tag.text)  # Replace the <a> tag with its text content
                elif a_tag.get('class')[0] in ['ref']:
                    a_tag.replace_with('')
                else:                       
                    a_tag.replace_with(" ") 
            else:
                if a_tag.get('role') in ["doc-biblioref"] or a_tag.get('href').find("https://onlinelibrary.wiley.com") != -1 or a_tag.get('href').find("https://www.nature.com/") != -1:
                    a_tag.replace_with(a_tag.text)
                else:
                    a_tag.replace_with(" ")    
 
        # Remove spaces before <i> or after </i> using regular expressions
        # desc_str_no_spaces = re.sub(r'\s+(?=<i>)|(?<=</i>)\s+', '', str(desc))
        # desc_str_no_spaces = re.sub(r'\s+(?=<sub>)|(?<=</sub>)\s+', '', desc_str_no_spaces)  # Remove spaces before <sub> or after </sub>        
        # desc_str_no_spaces = re.sub(r'\[.*?\]', ' ', desc_str_no_spaces)  # Remove []  
        # desc_str_no_spaces = re.sub(r'\(\)', ' ', desc_str_no_spaces)  # Remove () 

        artical_date = artical_date + '\n' + str(desc).strip()

# (1) html2Markdown
    # Create a new BeautifulSoup object from the modified HTML content
    extract_html = BeautifulSoup(artical_date, 'html.parser')
    mdfile = join(script_path, md_path, artical_title + ".md")
    with open(mdfile, "w") as file:
        # markdown_content = md(desc, strong_em_symbol="", escape_misc=False)  # Convert HTML to markdown
        markdown_content = MarkdownConverter(strip=['img', 'ol'], strong_em_symbol="", escape_misc=False).convert_soup(extract_html)
        markdown_content = re.sub(r'\n', '\n\n', str(markdown_content))
        markdown_content = re.sub(r'\n\s*\n', '\n\n', str(markdown_content))   # Merge consecutive empty lines into a single empty line
        file.write(str(markdown_content))

# (2) html2text
    with open("tmp.html", "w") as file:
        file.write(artical_date)

    textfile = join(script_path, md_path, artical_title + ".txt")
    with open(textfile, "w") as file:
        # file.write(desc.get_text().replace(r'\n', '\n'))  # Replace '\n' with actual newline characters
        # x = "This is a string\nwith\nnewlines\n"        
        # s = x.replace(r'\n', '\n')

        # import html2text
        # file.write(html2text.HTML2Text().handle(artical_date))

        x = desc.get_text().split('\n')
        for line in x:
            file.write(line + '\n')        




def extract_spring_artical(html_file_path, content_class, md_path='rstdir'):

    # Read the HTML file
    with open(html_file_path, "r") as file:
        html = file.read()
    # Use Beautidulsoup to extract information from html
    bs = BeautifulSoup(html, 'html.parser')
    with open("tmp.html", "w") as file:
        file.write(str(bs))

    print("Extracting data from", html_file_path)

    get_bib_doi(bs)

    # paper_title = bs.find(class_=title_class)
    meta_title = bs.find('meta', attrs={'property': 'og:title'})
    paper_title = meta_title['content']
    paper_title = re.sub(r'/', '', paper_title) 
    articles_data = ''
    # paper_title = bs.find('meta', attrs={'name': 'og:title'})['content']
    # print(paper_title) 
    # Find the meta tag with name "dc.title"
    # meta_tags = ['dc.title','prism.publicationName','prism.publicationDate','prism.doi']
    # for meta_tag in meta_tags:
    #     articles_data.append({meta_tag: get_mate_item(bs, meta_tag)})
    # print(articles_data)
 
    # Extract description 
    # desc = bs.find(class_=content_class)
    # desc_arr = bs.find_all('section', class_=[content_class])

    # desc_arr = bs.find_all('div', class_=['article_content-left'])  # ACS
    desc_arr = bs.find_all('div', class_=['main-content'])   #Nature Communications
    
    # Remove all <a> tags and their content
    for desc in desc_arr:
        for a in desc.find_all('a'):
            a.decompose()  # This removes the tag and its content
 
        # Remove spaces before <i> or after </i> in the HTML content using regular expressions
        desc_str_no_spaces = re.sub(r'\s+(?=<i>)|(?<=</i>)\s+', '', str(desc))
        desc_str_no_spaces = re.sub(r'\s+(?=<sub>)|(?<=</sub>)\s+', '', desc_str_no_spaces)  # remove spaces before <sub> or after </sub>
        
        desc_str_no_spaces = re.sub(r'\[.*?\]', '', desc_str_no_spaces)  # remove []  
        desc_str_no_spaces = re.sub(r'\(\)', '', desc_str_no_spaces)  # remove () 
        desc_str_no_spaces = re.sub(r'\s*(<img\s*[\d\s]+\s*>)\s*', '', desc_str_no_spaces) # remove content between <img and >

        articles_data = articles_data + '\n' + desc_str_no_spaces

    # Create a new BeautifulSoup object from the modified HTML content
    # desc = BeautifulSoup(desc_str_no_spaces, 'html.parser')
    desc = BeautifulSoup(articles_data, 'html.parser')
    

    # Create shorthand method for conversion
    def md(soup, **options):
        return MarkdownConverter(**options).convert_soup(soup)

    mdfile = join(script_path, md_path, paper_title + ".md")
    with open(mdfile, "w") as file:
        markdown_content = md(desc, strong_em_symbol="", escape_misc=False)  # Convert HTML to markdown
        markdown_content = re.sub(r'\n\s*\n', '\n\n', str(markdown_content))   # Merge consecutive empty lines into a single empty line
        file.write(str(markdown_content))
        # strip_markdown.strip_markdown_file(mdfile, join(script_path, md_path))


if __name__ == "__main__":    

    dir_path = os.path.dirname(os.path.realpath(__file__))
    # htmlfile = "/home/hktai/Downloads/Characterizing Students’ 4C Skills Development During Problem-based Digital Making _ Journal of Science Education and Technology.html"
    
    # Directory to search
    jounal_name = 'wiley Advanced Energy Materials'
    # jounal_name = 'wiley Advanced Materials'
    jounal_name = 'wiley Small'
    # jounal_name = 'Science'
    # jounal_name = 'Nature Energy'
    # jounal_name = 'Nature Communications'
    jounal_name = 'ACS Energy Letters'
    # jounal_name = 'ACS Nano'
    # jounal_name = 'ACS Nano Letters'
    

    dir_path = join(dir_path, 'sulfideSSE', jounal_name) 

    # Use glob to find all .html files
    # html_files = glob.glob(join(dir_path, '**', '*.html'), recursive=True)
    html_files = glob.glob(join(dir_path, '*.html'), recursive=True)

    # Print the paths of all .html files
    for html_file in html_files:
        if os.path.isfile(html_file):
            extract_artical(html_file)
            # extract_spring_artical(html_file)


