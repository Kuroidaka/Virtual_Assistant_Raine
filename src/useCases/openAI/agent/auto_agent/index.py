import autogen
import sys
import os
from dotenv import load_dotenv
load_dotenv()

# prompt = sys.argv[1]
# # config_list = config_list_from_json(env_or_file="OAI_CONFIG_LIST")
# config_list = autogen.config_list_from_json(
#     "src/useCases/openAI/agent/auto_agent/OAI_CONFIG_LIST",
#     filter_dict={
#         "model": ["gpt-4", "gpt-4-0314", "gpt4", "gpt-4-32k", "gpt-4-32k-0314", "gpt-4-32k-v0314"],
#     },
# )

config_path = '/src/useCases/openAI/agent/auto_agent/OAI_CONFIG_LIST' 

config_list = autogen.config_list_from_json(config_path, filter_dict={"model": ["gpt-4-1106-preview"]})

llm_config = { 
    'temperature': 0,
    'seed': 42,
    "config_list": config_list,
}

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    system_message="a human admin who will give ideal and run the code provided by coder",
    code_execution_config={"last_n_messages": 2, "work_dir": "src/useCases/openAI/agent/auto_agent/group_chat_coding"},
    human_input_mode="NEVER"    
)

coder = autogen.AssistantAgent(
    name="coder",
    llm_config=llm_config,
)

pm = autogen.AssistantAgent(
    name="product_manager",
    system_message="you will break down the the initial idea into a well scoped requirement for the coder; Do not involve in future conversations or error fixing",
)

# groupchat = autogen.GroupChat(
#     agents=[user_proxy, coder, pm], messages=[]
# )

# manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)

# user_proxy.initiate_chat(manager, message=prompt)


def start_task(execution_task: str, agent_list: list, llm_config: dict):

    group_chat = autogen.GroupChat(agents=agent_list, messages=[], max_round=12)
    manager = autogen.GroupChatManager(
        groupchat=group_chat, llm_config=llm_config
    )
    agent_list.initiate_chat(manager, message=execution_task)
    
start_task(
    execution_task="build a basic & simple pong game",
    agent_list=[user_proxy, coder, pm],
    llm_config=default_llm_config
)