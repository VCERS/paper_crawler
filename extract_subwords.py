
"""
Universal Part-of-Speech Tagset, https://www.nltk.org/book/ch05.html

ADJ	adjective	new, good, high, special, big, local
ADP	adposition	on, of, at, with, by, into, under
ADV	adverb	really, already, still, early, now
CONJ	conjunction	and, or, but, if, while, although
DET	determiner, article	the, a, some, most, every, no, which
NOUN	noun	year, home, costs, time, Africa
NUM	numeral	twenty-four, fourth, 1991, 14:24
PRT	particle	at, on, out, over per, that, up, with
PRON	pronoun	he, their, her, its, my, I, us
VERB	verb	is, say, told, given, playing, would
.	punctuation marks	. , ; !
X	other	ersatz, esprit, dunno, gr8, univeristy
"""

import nltk, json
import re
from absl import flags
from itertools import groupby

try:
  # Check if NLTK resources are available
  nltk.data.find('tokenizers/punkt')
  nltk.data.find('tokenizers/punkt_tab')
  nltk.data.find('taggers/averaged_perceptron_tagger')
  nltk.data.find('taggers/averaged_perceptron_tagger_eng')
except LookupError:
  nltk.download('punkt')
  nltk.download('punkt_tab')
  nltk.download('averaged_perceptron_tagger')
  nltk.download('averaged_perceptron_tagger_eng')



def getRemovedMDwithnknlp(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_doc = f.read()
   
    # Find all matches, 
    # pattern = r'(?:“([^“]*)”|(\S+))'
    # pattern = r'(?:“([^“]*)”|(\S+)|"([^"]+)"|(\S+)|\'([^\']+)\'|(\S+))'
    # matches = re.findall(pattern, md_doc) 
    # list_words = [match[0] if match[0] else match[1] for match in matches]

    list_words = md_doc.split()  
    #  print(list_words)

    for element_id, word in enumerate(list_words):
      list_words[element_id] = list_words[element_id].rstrip('[.,!?;:]')
      if word == 'etc.,' or word == 'etc.' or word == 'such' or word == 'such as' or word == 'e.g.,' or word == 'e.g.':
        list_words[element_id] = ','
        continue
      
      words = nltk.word_tokenize(word)
      pos_tags = nltk.pos_tag(words)

      for _, pos in pos_tags:
          # print(pos_tags)            
          if pos.startswith('DT') or pos.startswith('TO') or pos.startswith('CC') or pos.startswith('RB') or pos.startswith('IN') or pos.startswith('VB') or pos.startswith('WDT'):
              #  print(f"{word} should be remove, then replaced with a comma.")
            list_words[element_id] = ','

    list_words = [key for key, _ in groupby(list_words)]    
    #  print(list_words)
    # Construct a string by joining all elements of the list
    result_string = ' '.join(list_words)     
    # markdown_content = re.sub(r'\n\s*\n', '\n\n', str(markdown_content))  
    result_string = re.sub(r' ,', ',', result_string)   # Merge consecutive commas into a single comma
    # print(result_string)

    # remove duplicates except comma
    list_subwords = result_string.split(',')
    unique_list = []
    for item in list_subwords:
        item = item.strip()
        # Check if item is not equal to any existing element in unique_list (except for ',')
        if all(item != unique_item for unique_item in unique_list) or item == ',':        
            unique_list.append(item)
    list_subwords = unique_list

    return list_subwords
    

FLAGS = flags.FLAGS


def add_options():
  flags.DEFINE_string('db', default = 'vectordb', help = 'path to vectordb')
  flags.DEFINE_float('threshold', default = 0.5, help = 'threshold')
  flags.DEFINE_integer('max_words_per_entity', default = 3, help = 'maximum words for an entity')
  flags.DEFINE_string('input', default = None, help = 'path to input text')
  flags.DEFINE_string('output', default = 'output.json', help = 'path to output json')


def search_entities(words):
  # from langchain.embeddings.huggingface import HuggingFaceEmbeddings
  from langchain_huggingface import HuggingFaceEmbeddings
  from langchain_community.vectorstores import Neo4jVector

  embeddings = HuggingFaceEmbeddings(model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")  
  neo4j_store = Neo4jVector(username="neo4j", password="19841124", database="mner", url="bolt://103.6.49.76:7687", embedding=embeddings)
  

  # Creating Embeddings from existing graph, https://medium.com/thedeephub/building-a-graph-database-with-vector-embeddings-a-python-tutorial-with-neo4j-and-embeddings-277ce608634d
  existing_graph = Neo4jVector.from_existing_graph(embedding=embeddings, username="neo4j", password="19841124", database="mner", url="bolt://103.6.49.76:7687",
      index_name="embedding_index", node_label="BromideBasedCeramics", text_node_properties=["name", "formula"], embedding_node_property="embedding",)  
  rst = existing_graph.similarity_search("Lithium Lanthanum Zirconate", k=5)


  rst = neo4j_store.create_new_keyword_index(["name", "formula", "id"])

  print(rst)

  retriever = existing_graph.as_retriever(search_type = "similarity_score_threshold", search_kwargs = {"score_threshold": 0.6})
  tokens = list()

  # words = sentence.split(' ')
  # for n_words in range(1, FLAGS.max_words_per_entity + 1):
  #   for offset in range(n_words):
  #     for i in range(offset, len(words), n_words):
  #       substring = ' '.join(words[i:i + n_words])
  #       matches = retriever.invoke(substring)
  #       if len(matches):
  #         token_start_pos = sentence.find(substring)
  #         tokens.append((substring, sentence_start_pos + token_start_pos))
  # results = [(token[0],token[1],token[1] + len(token[0])) for token in tokens]
  # with open(FLAGS.output, 'w') as f:
  #   f.write(json.dumps(list(set(results))))



def retrieve_entities(words):
  from llama_index.graph_stores.neo4j import Neo4jPGStore
  from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore
  from llama_index.core.retrievers import  CustomPGRetriever, VectorContextRetriever, TextToCypherRetriever 
  from llama_index.vector_stores.neo4jvector import Neo4jVectorStore
  from hub_llms import embed_model

# URL web server: http://103.6.49.76:7474/browser/
  graph_store = Neo4jPropertyGraphStore(username="neo4j", password="19841124", database="neo4j", url="bolt://103.6.49.76:7687", )
  graph_store = Neo4jPGStore(username="neo4j", password="19841124", database="neo4j", url="bolt://103.6.49.76:7687", )
  
  max_words_per_entity = 3
  embed_model=embed_model
  neo4j_vector = Neo4jVectorStore(username="neo4j", password="19841124", database="neo4j", url="bolt://103.6.49.76:7687", embedding_dimension = 1536)

  vector_retriever = VectorContextRetriever(
              graph_store = graph_store,
              include_text = True,
              embed_model = embed_model,
              vector_store = neo4j_vector,
              similarity_top_k = 6,
              path_depth = 1,
          )

  for n_words in range(1, max_words_per_entity + 1):
    for offset in range(n_words):
      for i in range(offset, len(words), n_words):
        substring = ' '.join(words[i:i + n_words])
        nodes_matched = vector_retriever.retrieve(substring)
        print(nodes_matched)


if __name__ == '__main__':
    str1 = "The invention relates to a sulfide solid electrolyte, an electrode mix and a lithium ion battery. "
    str2 = "In recent years, with rapid spread of information-related equipment or communication equipment such as PCs, video cameras, mobile phones, etc., development of a battery."
        
    txtpdf_file = "./data/US20180069262A.txt" 
    # txtpdf_file = "./US20180069262A.txt"   
    list_subwords = getRemovedMDwithnknlp(txtpdf_file)
    print(list_subwords)
    print("Total number of subwords:", len(list_subwords))

    # search_entities("electrolyte")