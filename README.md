# BudgetMentor
BudgetMentor is an AI-Powered Financial Planning Application that combines traditional budgeting with AI-powered insights. It uses machine learning for spending pattern analysis, transaction categorization, and financial forecasting to help users make better financial decisions.

## Features

### Core Functionality
- **Dashboard**: Real-time financial overview with key metrics
- **Transaction Management**: Add, edit, and categorize transactions
- **Goal Setting**: Create and track financial goals with progress monitoring
- **AI Insights**: ML-powered spending analysis and recommendations

### AI/ML Features
- **Spending Pattern Analysis**: K-means clustering to identify user spending behavior
- **Transaction Categorization**: NLP-based automatic transaction categorization
- **Spending Forecasting**: LSTM neural networks for future spending prediction
- **Anomaly Detection**: Identifies unusual spending patterns
- **Personalized Recommendations**: AI-generated suggestions for budget optimization

## Technology Stack

### Frontend
- **React** with functional components and hooks
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **FastAPI** for REST API
- **SQLAlchemy** for database ORM
- **SQLite** for data storage
- **Pydantic** for data validation

### Machine Learning
- **Scikit-learn** for clustering and traditional ML
- **Transformers** (Hugging Face) for NLP categorization
- **Keras/TensorFlow** for LSTM forecasting
- **NumPy/Pandas** for data processing

## Installation

### Backend Setup
- Create virtual environment
```bash
python -m venv venv
venv\Scripts\activate
```

- Run the backend server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 
```
The API will be available at `http://localhost:8000`

### Frontend Setup
- Install dependencies in frontend directory
```bash
cd frontend
npm install
```

- Start development server
```bash
npm start
```
The application will be available at `http://localhost:3000`

## Dashboard
<img src="https://github.com/user-attachments/assets/f7b0e3d6-1538-4a84-a13e-4da4c5c49bdf">

### Transactions Page
<img src="https://github.com/user-attachments/assets/3a11d5dd-7c32-4c5a-bb20-db5417f0635d" width="600" height="600">

### Goals Page
<img src="https://github.com/user-attachments/assets/7d100d20-7fa3-41fd-bf27-fbff7ad15d1d" width="600" height="600">

### ML Insights Page
<img src="https://github.com/user-attachments/assets/4e8d4cd5-156f-4e2f-ab3b-4966aa680d2f" width="700" height="700">

## Database Schema

### Transactions Table
- `id`: Primary key
- `user_id`: User identifier
- `description`: Transaction description
- `amount`: Transaction amount (positive for income, negative for expenses)
- `category`: Transaction category
- `date`: Transaction date
- `predicted`: Boolean flag for ML-predicted transactions
- `confidence_score`: ML model confidence (0-1)

### Goals Table
- `id`: Primary key
- `user_id`: User identifier
- `name`: Goal name
- `target_amount`: Target amount to achieve
- `current_amount`: Current progress amount
- `priority`: Goal priority (High/Medium/Low)
- `deadline`: Goal deadline
- `created_at`: Creation timestamp

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/{id}` - Update goal progress
- `DELETE /api/goals/{id}` - Delete goal

### ML Services
- `POST /api/predict-cluster` - Get spending behavior cluster
- `POST /api/forecast` - Get spending forecast
- `POST /api/categorize` - Categorize transaction description

## Machine Learning Models

### 1. Spending Behavior Clustering
Uses K-means clustering to group users into spending categories:
- Conservative Spender
- Balanced Spender  
- High Spender

### 2. Transaction Categorization
Uses BART model for zero-shot classification: 
- Food & Dining, Transportation, Entertainment, Shopping, Utilities, Health & Fitness, Travel, Other

### 3. Spending Forecasting
LSTM neural network for time series prediction:
- Predicts future spending patterns
- Identifies seasonal trends
- Provides confidence intervals

### 4. Anomaly Detection
Statistical analysis to identify:
- Unusual spending amounts
- Unexpected category changes
- Suspicious transaction patterns
