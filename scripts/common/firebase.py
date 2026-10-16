import os

import firebase_admin
from firebase_admin import credentials, firestore

# serviceAccountKey.json sits in the scripts/ folder, one level above common/.
# Building the path from this file's location avoids errors when the script
# is launched from a different folder.
KEY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "serviceAccountKey.json",
)


def get_db():
    """Connect to Firestore with the service account and return the client."""
    cred = credentials.Certificate(KEY_PATH)
    firebase_admin.initialize_app(cred)
    return firestore.client()