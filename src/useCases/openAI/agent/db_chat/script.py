import os
import sys
import json

from sqlalchemy import create_engine
from llama_index.indices.struct_store.sql_query import NLSQLTableQueryEngine

from llama_index import SQLDatabase
from llama_index.llms import OpenAI

def askDB(inputObj):
    try:
        database = inputObj.get("database")
        username = inputObj.get("username")
        password = inputObj.get("password")
        host = inputObj.get("host")
        port = inputObj.get("port")
        query_string = inputObj.get("query_string")

        if not all([database, username, password, host, port, query_string]):
            raise ValueError("Missing required input parameters.")

        DATABASE_URL=f"mysql://{username}:{password}@{host}:{port}/{database}"

        llm = OpenAI(temperature=0, model="gpt-3.5-turbo")

        db_engine = create_engine(DATABASE_URL)
        sql_db = SQLDatabase(db_engine)

        query_engine = NLSQLTableQueryEngine(
            sql_database = sql_db,
        )

        res = query_engine.query(query_string)

        result = {
            "response": res.response,
            "sql_query": res.metadata['sql_query']
        }
    except Exception as e:
        result = {
            "error": str(e),
        }
    finally:
        if 'db_engine' in locals():
            db_engine.dispose()

    return result


if __name__ == "__main__":
    try:
        inputObj = json.loads(sys.argv[1])
        result = askDB(inputObj)
    except json.JSONDecodeError:
        result = {
            "error": "Invalid JSON input."
        }
    print(json.dumps(result))