from autogen import config_list_from_json
import autogen

def development_team(objective:str):
    config_list = config_list_from_json(env_or_file="OAI_CONFIG_LIST")
    
    dev = autogen.AssistantAgent(
        name="dev",
        system_message="You are a senior software engineer, you will write code to implement the requirement provided by the product manager",   
        llm_config={
            "config_list": config_list,
            "cache_seed": 42,
        },
    )

    pm = autogen.AssistantAgent(
        name="product_manager",
        system_message="you will break down the the initial idea into a well scoped requirement for the coder; Do not involve in future conversations or error fixing",
    )
    
    # qc = autogen.AssistantAgent(
    #     name="tester",
    #     system_message="You are a tester, you will test the code and report any bugs to the coder",
    #     code_execution_config={
    #         "work_dir":"src/useCases/openAI/agent/auto_agent/coding", 
    #         "last_n_messages": "auto",
    #     },
    # )
    

    user_proxy = autogen.UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=10,
        is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
        code_execution_config={
            "last_n_messages": 2,
            "work_dir": "src/useCases/openAI/agent/auto_agent/coding",
            "use_docker": False, 
        }
    )

    groupchat = autogen.GroupChat(
        agents=[user_proxy, dev, pm], messages=[]
    )
    
    manager = autogen.GroupChatManager(
        groupchat=groupchat, 
        llm_config={
            "config_list": config_list,
            "cache_seed": 42,
        }
    )
    
    user_proxy.initiate_chat(manager, message=objective)
development_team(objective=" build a basic & simple pong game")