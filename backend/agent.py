from urllib import response
from langgraph.graph import StateGraph
from typing import TypedDict
from langchain_groq import ChatGroq
import json, re
from config import GROQ_API_KEY, MODEL
from database import SessionLocal
from models import Interaction

# 🔹 Define State
class AgentState(TypedDict):
    input: str
    action: str
    data: dict
    output: str

# 🔹 Initialize LLM
llm = ChatGroq(
    model=MODEL,
    api_key=GROQ_API_KEY
)

# 🔹 Decision Node (Brain)
def decide_action(state: AgentState):
    prompt = f"""
    You are an AI CRM assistant.

    Classify the user input into ONE of the following actions:

    1. log → if user is describing a meeting, conversation, notes, or interaction
    2. edit → if user wants to modify/update an existing interaction

    Input:
    {state['input']}

    Rules:
    - Return ONLY one word: log OR edit
    - Do NOT explain anything
    - Default to log if unsure
"""

    response = llm.invoke(prompt)
    action = response.content.strip().lower()

    if action not in ["log", "edit"]:
        action = "log"

    return {
        "input": state["input"],
        "action": action,
        "data": {},
        "output": ""
    }
# 🔹 Tool 1: Log Interaction
def log_interaction(state: AgentState):
    prompt = f"""
    You are an AI CRM assistant.

    Extract structured JSON from this text:

    {state['input']}

    Return ONLY valid JSON:

    {{
    "hcp_name": "",
    "summary": "",
    "sentiment": "",
    "follow_up": ""
    }}

    Rules:
    - Extract doctor name (e.g., Dr. Reddy → hcp_name)
    - summary should be short and clear
    - sentiment:
        Positive → if interested, agreed, happy
        Negative → if rejected, not interested
        Neutral → otherwise
    - follow_up:
        If "samples" mentioned → "Send samples"
        If meeting planned → "Schedule follow-up"
        Else → "None"

    DO NOT return anything except JSON.
    """

    response = llm.invoke(prompt)

    try:
        data = json.loads(response.content)
    except:
        data = {
            "hcp_name": "Unknown",
            "summary": state["input"],
            "sentiment": "Neutral",
            "follow_up": "None"
        }
    # db = SessionLocal()

    # new_entry = Interaction(
    #     hcp_name=data.get("hcp_name"),
    #     summary=data.get("summary"),
    #     sentiment=data.get("sentiment"),
    #     follow_up=data.get("follow_up")
    # )

    # db.add(new_entry)
    # db.commit()
    # db.close()

    return {
        "input": state["input"],
        "action": "log",
        "data": data,
        "output": "Interaction Logged Successfully"
    }

# 🔹 Tool 2: Edit Interaction
def edit_interaction(state: AgentState):
    return {
        "input": state["input"],
        "action": state["action"],
        "data": {},
        "output": "Edit Interaction Triggered"
    }

# 🔹 Build Graph
builder = StateGraph(AgentState)

builder.add_node("decide", decide_action)
builder.add_node("log", log_interaction)
builder.add_node("edit", edit_interaction)

builder.set_entry_point("decide")

# 🔹 Conditional Routing
builder.add_conditional_edges(
    "decide",
    lambda state: state["action"],
    {
        "log": "log",
        "edit": "edit"
    }
)

builder.set_finish_point("log")
builder.set_finish_point("edit")

graph = builder.compile()