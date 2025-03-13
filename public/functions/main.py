from firebase_functions import https_fn
import firebase_admin
from firebase_admin import credentials, firestore
import drive_handler
from scrabble_dictionay.ScabbleDictionary import ScrabbleDictionary


db = firestore.client()

@https_fn.on_request()
def fetch_drive_file(request):
    """Firebase function triggered by an HTTP request to fetch latest file from Google Drive."""
    file_id, file_name = drive_handler.get_latest_file()
    
    if not file_id:
        return {"status": "error", "message": "No files found in Drive folder"}, 404
    # Check if the file was already processed
    doc_ref = db.collection("processed_files").document(file_id)
    doc = doc_ref.get()
    if doc.exists:
        print(f"File {file_id} already processed. Skipping...")
        return "Already processed", 200
    content_list = drive_handler.download_file(file_id)
    dictionary = ScrabbleDictionary(file_name[:-4])
    dawg = dictionary.build_from_word_list(content_list)
    dictionary.compress_and_store(dawg)
    doc_ref.set({"processed": True})
    return {"status": "success"}, 200

@https_fn.on_request()
def search_dictionary(request):
    word = request.args.get('word')
    prefix = request.args.get('prefix')
    dictionary = ScrabbleDictionary()
    d = dictionary.decompress_and_load()
    if prefix:
        l = dictionary.prefix_search_from_json(d,prefix)
        return{"prefix": prefix, "result": l},200
    else:
        t = dictionary.search_from_json(d,word)
        return {"word":word,"Found":t},200