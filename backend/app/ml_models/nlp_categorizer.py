import pandas as pd
import numpy as np
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle

class NLPCategorizer:
    def __init__(self):
        self.classifier = pipeline("zero-shot-classification", 
                                 model="facebook/bart-large-mnli")
        self.categories = [
            "Food & Dining", "Transportation", "Entertainment", 
            "Shopping", "Utilities", "Health & Fitness", "Travel", "Other"
        ]
        
    def categorize_transaction(self, description):
        """Use semantic understanding to categorize transactions"""
        result = self.classifier(description, self.categories)
        return result['labels'][0]
        
    def batch_categorize(self, descriptions):
        """Categorize multiple transactions efficiently"""
        return [self.categorize_transaction(desc) for desc in descriptions]

class SpendingForecaster:
    def __init__(self):
        self.model = None
        
    def train_lstm_model(self, spending_data):
        """Train LSTM model for time series forecasting"""
        from keras.models import Sequential
        from keras.layers import LSTM, Dense, Dropout
        
        # Prepare data for LSTM
        X, y = self.prepare_sequences(spending_data)
        
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(X.shape[1], X.shape[2])),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(X, y, batch_size=32, epochs=50, verbose=0)
        self.model = model
        
    def prepare_sequences(self, data, seq_length=30):
        """Prepare sequences for LSTM training"""
        X, y = [], []
        for i in range(seq_length, len(data)):
            X.append(data[i-seq_length:i])
            y.append(data[i])
        return np.array(X), np.array(y)
        
    def predict_future_spending(self, recent_data, periods=30):
        """Predict future spending for next N periods"""
        if self.model is None:
            raise ValueError("Model not trained yet")
            
        predictions = []
        current_data = recent_data[-30:].copy()
        
        for _ in range(periods):
            pred = self.model.predict(current_data.reshape(1, -1, 1))
            predictions.append(pred[0][0])
            current_data = np.append(current_data[1:], pred[0][0])
            
        return predictions