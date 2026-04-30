from pydantic import BaseModel

class InteractionCreate(BaseModel):
    input_text: str