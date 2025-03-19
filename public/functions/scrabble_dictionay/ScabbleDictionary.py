import gzip
import base64
import json
from scrabble_dictionay.DAWG import DAWG 
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
db = firestore.client()

MAX_CHUNK_SIZE = 950_000  # Slightly less than 1MB to account for Firestore limits
COLLECTION_NAME = "compressed_dawg_chunks"

class ScrabbleDictionary:
    """ Abstraction layer to the DAWG that we will  use in our functions to comply with Firebase restrictions
    :'( 
    My solution is a bit of overkill but here goes:
    Dictionary is fed in as a list (that is ingested from a .txt file on the drive but this will be explained 
    in the functions file) and the list is used to get a dawg object which is serialized into one dict. The dict
    is more than 1MB so we can't upload it as one JSON and if we were to put every node into a document we would
    have almost 60k nodes so we would need 3 days to write the dict to firestore because of the 20k write limit
    also query limit would quickly run out search is length of string reads and prefix search sum of the lengths
    from the prefix so it adds up quickly. What is the solution? Compress the one JSON. Still not enough? 
    split it into chunks ¯\_(ツ)_/¯. The catch????? Good question. The search is quick but every time we do the 
    search we have to load, decompress and decode the dictionary. Avg response time is 4 seconds which isn't 
    bad but could be much better if we didn't have these limits.  
    """
    def __init__(self, lang=None):
        self.lang = lang
        self.version = self.get_next_version()

    def get_next_version(self):
        # Fetch latest version from Firestore
        doc_ref = db.collection("scrabble_metadata").document(self.lang)
        doc = doc_ref.get()
        if doc.exists:
            latest_version = doc.to_dict().get("version", "1.0")
            major, minor = map(int, latest_version.split('.'))
            return f"{major}.{minor + 1}"  # Increment minor version
        return "1.0"

    def save_version(self):
        db.collection("scrabble_metadata").document(self.lang).set({"version": self.version})

    def build_from_word_list(self, words):
        dawg = DAWG()  
        words.sort()  # Ensure lexicographical order
        for word in words:
            dawg.insert(word)
        dawg.finish()
        return dawg

    def compress_and_store(self,dawg):
        original_data = dawg.serialize_dawg()
        # Compress with gzip
        compressed_bytes = gzip.compress(json.dumps(original_data).encode('utf-8'))
        
        # Encode as Base64 string
        compressed_b64 = base64.b64encode(compressed_bytes).decode('utf-8')
        
        # Split into chunks under 1MB
        chunks = []
        for i in range(0, len(compressed_b64), MAX_CHUNK_SIZE):
            chunks.append(compressed_b64[i:i + MAX_CHUNK_SIZE])
        
        # Store each chunk in Firestore
        doc_ref = db.collection(COLLECTION_NAME).document("dawg")
        doc_ref.set({
            "compression": "gzip",
            "original_size": len(json.dumps(original_data)),
            "compressed_size": len(compressed_b64),
            "total_chunks": len(chunks),
            "lang": self.lang
        })
        
        for i, chunk in enumerate(chunks):
            db.collection(COLLECTION_NAME).document(f"dawg_chunk_{i}").set({
                "chunk_index": i,
                "data": chunk
            })
        
        print(f"Stored {len(chunks)} chunks in Firestore.")

    def decompress_and_load(self):
        # Retrieve metadata
        meta_doc = db.collection(COLLECTION_NAME).document("dawg").get()
        if not meta_doc.exists:
            raise ValueError("No metadata found in Firestore.")
        metadata = meta_doc.to_dict()
        total_chunks = metadata["total_chunks"]
        expected_compressed_size = metadata["compressed_size"]
        self.lang = metadata["lang"]
        
        # Retrieve and reconstruct chunks
        chunks = []
        total_chunk_length = 0
        for i in range(total_chunks):
            chunk_doc = db.collection(COLLECTION_NAME).document(f"dawg_chunk_{i}").get()
            if not chunk_doc.exists:
                raise ValueError(f"Missing chunk {i} in Firestore.")
            chunk_data = chunk_doc.to_dict()["data"]
            chunks.append(chunk_data)
            total_chunk_length += len(chunk_data)
        
        # Verify chunk lengths match the compressed size
        if total_chunk_length != expected_compressed_size:
            raise ValueError(f"Chunk lengths ({total_chunk_length}) do not match compressed size ({expected_compressed_size})")
        
        # Combine chunks into a single Base64 string
        compressed_b64 = "".join(chunks)
        
        # Decode from Base64 and decompress with gzip
        compressed_bytes = base64.b64decode(compressed_b64)
        decompressed_json = gzip.decompress(compressed_bytes).decode('utf-8')
        
        # Load into a dictionary
        return json.loads(decompressed_json)
    
    def search_from_json(self,d,word, root_id = "root"):
        current_node = d[root_id]
        for char in word:
            try:
                next_id = current_node["edges"][char]
                current_node = d[next_id]
            except KeyError:
                return False
        return current_node["final"]
    
    def reconstruct_words_from_dictionary(self,d, node, prefix="", words=None):
        """
        Recursively reconstructs all possible words stored in the DAWG from a prefix
        
        :param node: The current DAWGNode being traversed.
        :param prefix: The current word being built.
        :param words: A set to store the found words.
        :return: A set of words reconstructed from the DAWG.
        """
        if words is None:
            words = set()
        # If this node is final, add the current prefix to words
        if node["final"]:
            words.add(prefix)

        # Recursively traverse all edges
        for char, child in node["edges"].items():
            self.reconstruct_words_from_dictionary(d, d[child], prefix + char, words)

        return words
    
    def prefix_search_from_json(self,d,prefix, root_id = "root"):
        current_node = d[root_id]
        for char in prefix:
            try:
                next_id = current_node["edges"][char]
                current_node = d[next_id]
            except KeyError:
                return []
        return list(self.reconstruct_words_from_dictionary(d,current_node,prefix))



    