import os
import sys
import json

from sqlalchemy import create_engine
from llama_index.indices.struct_store.sql_query import NLSQLTableQueryEngine

from llama_index import SQLDatabase
from llama_index.llms import OpenAI
from llama_index import ServiceContext
from llama_index import set_global_service_context
from llama_index.prompts import PromptTemplate

text_to_sql_tmpl = """\
Given an input question, first create a syntactically correct {dialect} \
query to run, then look at the results of the query and return the answer. \
You can order the results by a relevant column to return the most \
interesting examples in the database.

Pay attention to use only the column names that you can see in the schema \
description. Be careful to not query for columns that do not exist. \
Pay attention to which column is in which table. Also, qualify column names \
with the table name when needed. 

IMPORTANT NOTE: Always use CONVERT_TZ(time,'+00:00','+07:00')  for the time for every table that has time column.

When there are a request to show the pending or the upcoming reminder task, please use the following query:

SELECT CONVERT_TZ(Task.time,'+00:00','+07:00'), Task.title, Task.repeat
FROM Task
WHERE CONVERT_TZ(time,'+00:00','+07:00') > NOW();



You are required to use the following format, \
each taking one line:

Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here \
    
Only use tables listed below.
{schema}


Question: {query_str}
SQLQuery: 
"""



task_table_desc = """\
This table represents Reminder Tasks. Each row contains the following columns:
id: Unique identifier of the task
title: Title of the task
time: The time when the task is scheduled
repeat: Boolean value indicating whether the task is repetitive, 1 for True and 0 for False
createdAt: The time when the task was created
updatedAt: The time when the task was last updated
"""

file_table_desc = """\
This table represents Files. Each row contains the following columns:
id: Unique identifier of the file
name: Name of the file
path: The path where the file is stored
extension: The extension type of the file
size: The size of the file
url: The URL of the file
createdAt: The time when the file was created
updatedAt: The time when the file was last updated
"""

conversation_table_desc = """\
This table represents Conversations. Each row contains the following columns:
id: Unique identifier of the conversation
name: Name of the conversation
from: The sender of the last message in the conversation
lastMessage: The content of the last message in the conversation
lastMessageAt: The time when the last message was sent
createdAt: The time when the conversation was created
updatedAt: The time when the conversation was last updated
messages: List of messages in the conversation
"""

message_table_desc = """\
This table represents Messages. Each row contains the following columns:
id: Unique identifier of the message
createdAt: The time when the message was created
updatedAt: The time when the message was last updated
text: The content of the message
sender: The sender of the message, either 'user' or 'bot'
senderID: The identifier of the sender
conversation: The conversation to which the message belongs
conversationId: The identifier of the conversation
imgList: List of images in the message
"""

image_file_table_desc = """\
This table represents Image Files. Each row contains the following columns:
id: Unique identifier of the image file
url: The URL of the image file
messageId: The identifier of the message to which the image file belongs
message: The message to which the image file belongs
createdAt: The time when the image file was created
updatedAt: The time when the image file was last updated
"""

context_query_kwargs = {
    "task": task_table_desc,
    "file": file_table_desc,
    "conversation": conversation_table_desc,
    "message": message_table_desc,
    "image_file": image_file_table_desc,
    
}

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
        service_context = ServiceContext.from_defaults(llm=llm)
        set_global_service_context(service_context)

        db_engine = create_engine(DATABASE_URL)
        sql_db = SQLDatabase(db_engine)

        query_engine = NLSQLTableQueryEngine(
            sql_database = sql_db,
            verbose = True,
            text_to_sql_prompt = PromptTemplate(text_to_sql_tmpl),
            context_query_kwargs = context_query_kwargs
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
    
    #  please alway using CONVERT_TZ(time,'+07:00','+00:00') for the time

# ref docs
# https://docs.llamaindex.ai/en/stable/examples/query_engine/pgvector_sql_query_engine.html#define-prompt