import os
from pymongo import MongoClient
import pandas as pd
from dotenv import load_dotenv

# Load env file from the parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Use the same default DB configs if env is missing
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/finco_db")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database() # Uses the DB from the URI, default to finco_db
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

def get_user_transactions(user_id=None, month=None, year=None):
    """
    Fetch transactions for a specific user, or all transactions if user_id is None.
    Optional month and year parameters for filtering.
    """
    if db is None:
        return pd.DataFrame()
        
    collection = db['transactions']
    
    query = {}
    if user_id and user_id != "default_user":
        from bson.objectid import ObjectId
        try:
            query["user"] = ObjectId(user_id)
        except:
             query["user"] = user_id

    if month and year:
        import datetime
        start_date = datetime.datetime(int(year), int(month), 1)
        if int(month) == 12:
            end_date = datetime.datetime(int(year) + 1, 1, 1)
        else:
            end_date = datetime.datetime(int(year), int(month) + 1, 1)
        query["date"] = {"$gte": start_date, "$lt": end_date}
             
    # Fetch data sorted by date
    try:
        cursor = collection.find(query).sort('date', 1)
        transactions = list(cursor)
        
        if not transactions:
            return pd.DataFrame()
            
        # Convert to pandas DataFrame
        df = pd.DataFrame(transactions)
        
        # Format the df to match what the old endpoint expected
        if '_id' in df.columns:
            df['_id'] = df['_id'].astype(str)
        if 'user' in df.columns:
            df['user'] = df['user'].astype(str)
            
        return df
    except Exception as e:
        print(f"Database extraction error: {e}")
        return pd.DataFrame()

if __name__ == "__main__":
    # Test script output
    if db is not None:
        print(f"Connected to {db.name}")
        df = get_user_transactions()
        print(f"Extracted {len(df)} total transactions.")
        if not df.empty:
            print(df.head())
    else:
        print("Failed to initialize database.")
