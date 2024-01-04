import os
from autogen import config_list_from_json
import autogen
from common.scrape import scrape
from common.serp import search


def research(query):
    config_list = config_list_from_json(env_or_file="OAI_CONFIG_LIST")
    
    llm_config_researcher = {
        "functions": [
            {
                "name": "search",
                "description": "google search for relevant information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Google search query",
                        }
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "scrape",
                "description": "Scraping website content based on url",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "Website url to scrape",
                        }
                    },
                    "required": ["url"],
                },
            },
        ],
        "config_list": config_list
    }

    researcher = autogen.AssistantAgent(
        name="researcher",
        system_message="Research about a given query, collect as many information as possible, and generate detailed research results with loads of technique details with all reference links attached; Add TERMINATE to the end of the research report;",
        llm_config=llm_config_researcher,
    )

    user_proxy = autogen.UserProxyAgent(
        name="User_proxy",
        code_execution_config={"last_n_messages": 2, "work_dir": "coding"},
        # is_termination_msg=lambda x: x.get("content", "") and x.get(
        #     "content", "").rstrip().endswith("TERMINATE"),
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
        function_map={
            "search": search,
            "scrape": scrape,
        }
    )

    user_proxy.initiate_chat(researcher, message=query)

    # set the receiver to be researcher, and get a summary of the research report
    user_proxy.stop_reply_at_receive(researcher)
    user_proxy.send(
        "Give me the research report that just generated again, return ONLY the report & reference links", researcher)

    # return the last message the expert received
    return user_proxy.last_message()["content"]