# Scrabble Dictionary with DAWG Compression

## Overview

This solution is designed to efficiently store and search a Directed Acyclic Word Graph (DAWG) representation of a dictionary using **Firebase Firestore**. Due to Firebase's limitations on document size (1MB max) and write limits (20K per day), a straightforward implementation is infeasible. Here's the breakdown of the approach:

1. **Dictionary Input**: The dictionary is ingested as a list from a `.txt` file stored in Google Drive.
2. **DAWG Serialization**: The list is converted into a **DAWG object** and then serialized into a single dictionary.
3. **Compression & Chunking**:
   - The serialized DAWG is compressed using **gzip**.
   - If the compressed size exceeds 1MB, it is **split into chunks**.
   - Each chunk is stored separately in Firestore.
4. **Querying**:
   - Every search request loads, decompresses, and reconstructs the DAWG dictionary.
   - **Search operations** include:
     - Exact word lookup
     - Prefix-based word search
5. **Performance Considerations**:
   - Average response time is **~4 seconds** due to decompression overhead.
   - Performance is limited by Firestore's read/write constraints but remains usable.

## Running and Testing Firebase Functions
### **1. Create the virtual environment**
```sh
cd public/functions/
python -m venv venv
source venv/bin/activate #for linux & MAC
venv\Scripts\activate #for windows
pip install -r requirements.txt
```
To test the **dictionary search** and **data ingestion** functions locally, you can use the Firebase emulator:

### **2. Start Firebase Emulator**
```sh
firebase serve --only functions
```

### **3. Test API Endpoints**
You can use **curl** or **Postman** to test the endpoints:

#### **Search for Words**
- **Exact Word Search**
  ```sh
  curl "http://localhost:5001/scrabblewepapp/us-central1/search_dictionary?word=yourword"
  ```
- **Prefix Search**
  ```sh
  curl "http://localhost:5001/scrabblewepapp/us-central1/search_dictionary?prefix=yourprefix"
  ```

#### **Fetch and Process Dictionary from Drive**
```sh
curl "http://localhost:5001/scrabblewepapp/us-central1/fetch_drive_file"
```

## Deployment
Once tested locally, deploy the functions to Firebase using:
```sh
firebase deploy --only functions
```

## Future Improvements
- Optimize decompression speed by caching the DAWG in memory.
- Explore alternative storage solutions for larger dictionaries.
- Improve prefix search efficiency using Firestore indexes.

🚀 **Happy Scrabbling!**

