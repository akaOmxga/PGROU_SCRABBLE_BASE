from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# Load Google Drive API credentials
CREDENTIALS_FILE = "./scrabble_dictionay/serviceAccountKey.json"

def authenticate_drive():
    """Authenticate and return Google Drive service."""
    creds = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=["https://www.googleapis.com/auth/drive"]
    )
    service = build("drive", "v3", credentials=creds)
    return service

def get_latest_file():
    """Retrieve the latest uploaded file from a specific Google Drive folder 
    The folder is PGROUP:SCRABBLE/Dicts"""
    service = authenticate_drive()
    
    folder_id = "1T_YowJv3iKMj5wpr_-V5jb8S_IN8WoDA"
    
    query = f"'{folder_id}' in parents and trashed=false"
    results = service.files().list(
        q=query,
        pageSize=1,
        fields="files(id, name, mimeType)",
        orderBy="createdTime desc"
    ).execute()
    
    files = results.get("files", [])
    
    if not files:
        return None, None

    latest_file = files[0]
    return latest_file["id"], latest_file["name"]

def download_file(file_id):
    """Download the file content as a list of lines"""
    service = authenticate_drive()
    
    request = service.files().get_media(fileId=file_id)
    file_data = io.BytesIO()
    
    downloader = MediaIoBaseDownload(file_data, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()

    file_data.seek(0)
    content = file_data.read().decode("utf-8").splitlines()
    return content
