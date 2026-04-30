from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Interaction
from agent import graph
from schemas import InteractionCreate
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Chat API
@app.post("/chat")
def chat(data: InteractionCreate, db: Session = Depends(get_db)):
    result = graph.invoke({"input": data.input_text})

    if "data" in result:
        record = Interaction(**result["data"])
        db.add(record)
        db.commit()
        db.refresh(record)

    return result
@app.get("/interactions")
def get_interactions(db: Session = Depends(get_db)):
    records = db.query(Interaction).all()

    return [
        {
            "id": r.id,
            "hcp_name": r.hcp_name,
            "summary": r.summary,
            "sentiment": r.sentiment,
            "follow_up": r.follow_up,
        }
        for r in records
    ]
# Home route
@app.get("/")
def home():
    return {"message": "AI CRM Backend Running"}