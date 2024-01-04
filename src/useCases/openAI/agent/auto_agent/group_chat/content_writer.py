import autogen
import os
from autogen import config_list_from_json

def write_content(research_material, topic):
    config_list = config_list_from_json(env_or_file="OAI_CONFIG_LIST")
    editor = autogen.AssistantAgent(
        name="editor",
        system_message="You are a senior editor of an AI blogger, you will define the structure of a short blog post based on material provided by the researcher, and give it to the writer to write the blog post",
        llm_config={"config_list": config_list},
    )

    writer = autogen.AssistantAgent(
        name="writer",
        system_message="You are a professional AI blogger who is writing a blog post about AI, you will write a short blog post based on the structured provided by the editor, and feedback from reviewer; After 2 rounds of content iteration, add TERMINATE to the end of the message",
        llm_config={"config_list": config_list},
    )

    reviewer = autogen.AssistantAgent(
        name="reviewer",
        system_message="You are a world class hash tech blog content critic, you will review & critic the written blog and provide feedback to writer.After 2 rounds of content iteration, add TERMINATE to the end of the message",
        llm_config={"config_list": config_list},
    )

    user_proxy = autogen.UserProxyAgent(
        name="admin",
        system_message="A human admin. Interact with editor to discuss the structure. Actual writing needs to be approved by this admin.",
        code_execution_config=False,
        # is_termination_msg=lambda x: x.get("content", "") and x.get(
        #     "content", "").rstrip().endswith("TERMINATE"),
        human_input_mode="NEVER",
    )

    groupchat = autogen.GroupChat(
        agents=[user_proxy, editor, writer, reviewer],
        messages=[],
        max_round=20)
    manager = autogen.GroupChatManager(groupchat=groupchat)

    user_proxy.initiate_chat(
        manager, message=f"Write a blog about {topic}, here are the material: {research_material}")

    user_proxy.stop_reply_at_receive(manager)
    user_proxy.send(
        "Give me the blog that just generated again, return ONLY the blog, and add TERMINATE in the end of the message", manager)

    # return the last message the expert received
    return user_proxy.last_message()["content"]

