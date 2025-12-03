from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

app = FastAPI(title="AI Task Manager API", version="1.0.0")

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    completed: bool = False

@app.get("/")
def read_root():
    return {"message": "AI Task Manager API with FastAPI"}

@app.get("/api/tasks")
def get_tasks():
    return {"message": "Tasks endpoint"}

@app.get("/api/users")
def get_users():
    return {"message": "Users endpoint"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    uvicorn.run(app, host="0.0.0.0", port=port)