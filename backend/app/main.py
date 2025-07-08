from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pickle
import os
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.database import SessionLocal, Transaction, Goal
from datetime import datetime
from typing import List

app = FastAPI(title="BudgetMentor")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ML Models
class MLService:
    def __init__(self):
        self.clustering_model = KMeans(n_clusters=3, random_state=42)
        self.scaler = StandardScaler()
        
    def predict_spending_cluster(self, spending_data):
        # Simplified clustering logic
        features = np.array(spending_data).reshape(1, -1)
        cluster = self.clustering_model.fit_predict(features)
        clusters = ["Conservative Spender", "Balanced Spender", "High Spender"]
        return clusters[cluster[0]]
        
    def forecast_spending(self, historical_data):
        # Simplified forecasting (replace with LSTM)
        trend = np.mean(historical_data[-3:])
        forecast = [trend * (1 + np.random.normal(0, 0.1)) for _ in range(4)]
        return forecast

ml_service = MLService()

class TransactionCreate(BaseModel):
    description: str
    amount: float
    category: str
    date: str
    predicted: bool = False

class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    date: datetime
    predicted: bool
    
    class Config:
        orm_mode = True

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    priority: str
    deadline: str

class GoalResponse(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    priority: str
    deadline: datetime
    
    class Config:
        orm_mode = True

@app.get("/")
async def root():
    return {"message": "BudgetMentor is running"}

@app.post("/api/predict-cluster")
async def predict_cluster(spending_data: dict):
    try:
        cluster = ml_service.predict_spending_cluster(
            [spending_data["food"], spending_data["transport"], spending_data["entertainment"]]
        )
        return {"cluster": cluster}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forecast")
async def forecast_spending(historical_data: dict):
    try:
        forecast = ml_service.forecast_spending(historical_data["spending"])
        return {"forecast": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transactions", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    try:
        db_transaction = Transaction(
            user_id="user",  
            description=transaction.description,
            amount=transaction.amount,
            category=transaction.category,
            date=datetime.fromisoformat(transaction.date),
            predicted=transaction.predicted
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/transactions", response_model=List[TransactionResponse])
async def get_transactions(db: Session = Depends(get_db)):
    try:
        transactions = db.query(Transaction).filter(Transaction.user_id == "user").all()
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/goals", response_model=GoalResponse)
async def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    try:
        db_goal = Goal(
            user_id="user",  
            name=goal.name,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            priority=goal.priority,
            deadline=datetime.fromisoformat(goal.deadline)
        )
        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)
        return db_goal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/goals", response_model=List[GoalResponse])
async def get_goals(db: Session = Depends(get_db)):
    try:
        goals = db.query(Goal).filter(Goal.user_id == "user").all()
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GoalUpdate(BaseModel):
    current_amount: float

@app.put("/api/goals/{goal_id}")
async def update_goal(goal_id: int, goal_update: GoalUpdate, db: Session = Depends(get_db)):
    try:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        goal.current_amount = goal_update.current_amount
        db.commit()
        return {"message": "Goal updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    try:
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        db.delete(transaction)
        db.commit()
        return {"message": "Transaction deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    try:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        db.delete(goal)
        db.commit()
        return {"message": "Goal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
