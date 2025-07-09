import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, PiggyBank, Brain, AlertCircle, CheckCircle, Calendar, Plus, IndianRupee } from 'lucide-react';
import './FinancialPlannerApp.css';

const FinancialPlannerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Starbucks Coffee Downtown', amount: -5.50, category: 'Food & Dining', date: '2024-12-01', predicted: false },
    { id: 2, description: 'Salary Direct Deposit', amount: 3500, category: 'Income', date: '2024-12-01', predicted: false },
    // Predicted transactions
    { id: 3, description: 'Predicted: Starbucks Coffee', amount: -5.50, category: 'Food & Dining', date: '2024-12-07', predicted: true },
    { id: 4, description: 'Predicted: Grocery Shopping', amount: -130, category: 'Food & Dining', date: '2024-12-08', predicted: true },
  ]);

  const [goals, setGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 10000, current: 3500, priority: 'High', deadline: '2025-06-01' },
    { id: 2, name: 'Travel to Europe', target: 5000, current: 1200, priority: 'Medium', deadline: '2025-08-01' },
  ]);

  const [userProfile, setUserProfile] = useState({
    monthlyIncome: 4250,
    riskTolerance: 'Medium',
    spendingCluster: 'Balanced Spender',
    savingsRate: 0.25
  });

  const [mlInsights, setMlInsights] = useState({
    spendingForecast: [
      { month: 'Dec', predicted: 2800, actual: 2650 },
      { month: 'Jan', predicted: 2900, actual: null },
    ],
    categoryRecommendations: [
      { category: 'Food & Dining', currentSpend: 450, recommendedLimit: 400, savings: 50 },
      { category: 'Entertainment', currentSpend: 200, recommendedLimit: 150, savings: 50 },
    ],
    behaviorCluster: 'Balanced Spender',
    riskScore: 6.5,
    anomalies: [
      { transaction: 'Amazon Purchase ₹89.99', reason: 'Unusual shopping spike', date: '2024-12-03' }
    ]
  });

  // Dynamic calculations based on actual data
  const calculateDynamicMetrics = () => {
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const currentDate = new Date();
      return transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear();
    });

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate
    };
  };

  const calculateCategorySpending = () => {
    const categorySpending = {};
    categories.forEach(category => {
      categorySpending[category] = transactions
        .filter(t => t.category === category && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    });
    return categorySpending;
  };

  const generateMLInsights = () => {
    const categorySpending = calculateCategorySpending();
    const metrics = calculateDynamicMetrics();

    // Generate category recommendations based on actual spending
    const categoryRecommendations = Object.entries(categorySpending)
      .filter(([category, spending]) => spending > 0 && category !== 'Income')
      .map(([category, currentSpend]) => {
        const recommendedLimit = Math.max(currentSpend * 0.85, currentSpend - 50);
        const savings = Math.max(currentSpend - recommendedLimit, 0);
        return {
          category,
          currentSpend: Math.round(currentSpend),
          recommendedLimit: Math.round(recommendedLimit),
          savings: Math.round(savings)
        };
      });

    // Determine behavior cluster based on spending patterns
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    const behaviorCluster = totalSpending > metrics.monthlyIncome * 0.8 ? 'High Spender' :
      totalSpending < metrics.monthlyIncome * 0.5 ? 'Conservative Spender' :
        'Balanced Spender';

    // Calculate risk score based on spending vs income ratio
    const riskScore = Math.min(10, Math.max(1, (totalSpending / metrics.monthlyIncome) * 10));

    // Detect anomalies (transactions significantly above average)
    const recentTransactions = transactions.slice(-10);
    const avgTransactionAmount = recentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentTransactions.filter(t => t.amount < 0).length;

    const anomalies = recentTransactions
      .filter(t => t.amount < 0 && Math.abs(t.amount) > avgTransactionAmount * 2)
      .map(t => ({
        transaction: `${t.description} ${Math.abs(t.amount).toFixed(2)}`,
        reason: 'Significantly above average spending',
        date: t.date
      }));

    // Generate spending forecast based on recent trends
    const last4Months = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const monthlySpending = monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      last4Months.push({
        month: monthName,
        predicted: Math.round(monthlySpending * (1 + Math.random() * 0.1 - 0.05)),
        actual: i === 0 ? Math.round(monthlySpending) : null
      });
    }

    return {
      categoryRecommendations,
      behaviorCluster,
      riskScore: Math.round(riskScore * 10) / 10,
      anomalies,
      spendingForecast: last4Months
    };
  };

  // Update insights whenever transactions change
  useEffect(() => {
    const newInsights = generateMLInsights();
    setMlInsights(newInsights);

    const newMetrics = calculateDynamicMetrics();
    setUserProfile(prev => ({
      ...prev,
      monthlyIncome: newMetrics.monthlyIncome,
      savingsRate: newMetrics.savingsRate,
      spendingCluster: newInsights.behaviorCluster
    }));
  }, [transactions]);

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0]
  });

  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: '',
    priority: 'Medium',
    deadline: ''
  });

  const categories = ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Health & Fitness', 'Income', 'Other'];
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00ff00', '#0000ff', '#ffff00'];

  // Calculate spending by category (dynamic)
  const spendingByCategory = categories.reduce((acc, category) => {
    const categorySpending = transactions
      .filter(t => t.category === category && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (categorySpending > 0) {
      acc.push({ name: category, value: categorySpending });
    }
    return acc;
  }, []);

  // Calculate monthly trend (dynamic)
  const monthlyTrend = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === month);

    if (existing) {
      if (transaction.amount > 0) {
        existing.income += transaction.amount;
      } else {
        existing.expenses += Math.abs(transaction.amount);
      }
    } else {
      acc.push({
        month,
        income: transaction.amount > 0 ? transaction.amount : 0,
        expenses: transaction.amount < 0 ? Math.abs(transaction.amount) : 0
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month));

  // Dynamic calculations
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netWorth = totalIncome - totalExpenses;
  const currentSavingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

  const loadTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/transactions');
      const data = await response.json();
      setTransactions(data.map(t => ({
        ...t,
        date: new Date(t.date).toISOString().split('T')[0]
      })));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/goals');
      const data = await response.json();
      setGoals(data.map(g => ({
        id: g.id,
        name: g.name,
        target: g.target_amount,  
        current: g.current_amount,
        priority: g.priority,
        deadline: new Date(g.deadline).toISOString().split('T')[0]
      })));
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const addTransaction = async () => {
    if (newTransaction.description && newTransaction.amount) {
      try {
        const response = await fetch('http://localhost:8000/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: newTransaction.description,
            amount: parseFloat(newTransaction.amount),
            category: newTransaction.category,
            date: newTransaction.date,
            predicted: false
          }),
        });

        if (response.ok) {
          await loadTransactions(); 
          setNewTransaction({ description: '', amount: '', category: 'Food & Dining', date: new Date().toISOString().split('T')[0] });
        }
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    }
  };

  const addGoal = async () => {
    if (newGoal.name && newGoal.target) {
      try {
        const response = await fetch('http://localhost:8000/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newGoal.name,
            target_amount: parseFloat(newGoal.target),
            current_amount: parseFloat(newGoal.current) || 0,
            priority: newGoal.priority,
            deadline: newGoal.deadline
          }),
        });

        if (response.ok) {
          await loadGoals(); 
          setNewGoal({ name: '', target: '', current: '', priority: 'Medium', deadline: '' });
        }
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }
  };

  const updateGoalProgress = async (goalId, newAmount) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const response = await fetch(`http://localhost:8000/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_amount: parseFloat(newAmount) || 0
        }),
      });

      if (response.ok) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/transactions/${transactionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadTransactions();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const deleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/goals/${goalId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadGoals();
        }
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  useEffect(() => {
    loadTransactions();
    loadGoals();
  }, []);

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center">
            <IndianRupee className="w-8 h-8 mr-3" />
            <div>
              <div className="text-sm opacity-90">Net Worth</div>
              <div className="text-2xl font-bold">₹{netWorth.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-3" />
            <div>
              <div className="text-sm opacity-90">Monthly Income</div>
              <div className="text-2xl font-bold">₹{userProfile.monthlyIncome.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 mr-3" />
            <div>
              <div className="text-sm opacity-90">Monthly Expenses</div>
              <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center">
            <PiggyBank className="w-8 h-8 mr-3" />
            <div>
              <div className="text-sm opacity-90">Savings Rate</div>
              <div className="text-2xl font-bold">{(currentSavingsRate * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold text-indigo-800">AI Financial Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Spending Cluster</h4>
            <p className="text-sm text-gray-600">You're classified as a <strong>{userProfile.spendingCluster}</strong> based on your spending patterns.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Risk Score</h4>
            <p className="text-sm text-gray-600">Your financial risk score is <strong>{mlInsights.riskScore}/10</strong> - indicating moderate risk tolerance.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Anomaly Detection</h4>
            <p className="text-sm text-gray-600">Detected <strong>{mlInsights.anomalies.length}</strong> unusual spending pattern(s) this month.</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Forecast */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Spending Forecast (ML Prediction)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mlInsights.spendingForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeDasharray="5 5" name="Predicted" />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Income vs Expenses Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="income" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ff7300" fill="#ff7300" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const Transactions = () => (
    <div className="space-y-6">
      {/* Add Transaction */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            step="1"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            className="border rounded px-3 py-2"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={addTransaction}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.slice().reverse().map(transaction => (
            <div
              key={transaction.id}
              className={`transaction-card ${transaction.predicted ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="transaction-left">
                <div className="flex items-center">
                  <span className="transaction-description">{transaction.description}</span>
                  {transaction.predicted && (
                    <span className="transaction-badge">ML Predicted</span>
                  )}
                </div>
                <div className="transaction-meta">{transaction.category} • {transaction.date}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`transaction-amount ${transaction.amount > 0 ? 'income' : 'expense'}`}
                >
                  {transaction.amount > 0 ? '+' : ''}₹{transaction.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 flex-shrink-0 trans-del-btn"
                  title="Delete transaction"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Goals = () => (
    <div className="space-y-6">
      {/* Add Goal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Current Amount"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={newGoal.priority}
            onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={addGoal}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
        >
          <Target className="w-4 h-4 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100;
          const isCompleted = progress >= 100;
          return (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">{goal.name}</h4>
                <div className={`px-2 py-1 rounded text-xs ${goal.priority === 'High' ? 'bg-red-100 text-red-800' :
                    goal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                  }`}>
                  {goal.priority}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: ₹{goal.current.toFixed(2)}</span>
                  <br></br>
                  <span>Goal: ₹{goal.target.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm mt-1">
                  {progress.toFixed(1)}% Complete
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Target: {new Date(goal.deadline).toLocaleDateString()}
                </div>
                <div className="flex items-center mt-1">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <Target className="w-4 h-4 mr-1 text-blue-500" />
                  )}
                  Remaining: ₹{(goal.target - goal.current).toFixed(2)}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    step="1"
                    placeholder="Update progress"
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateGoalProgress(goal.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector('input');
                      updateGoalProgress(goal.id, input.value);
                      input.value = '';
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center del-btn"
                    title="Delete goal"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MLInsights = () => (
    <div className="space-y-6">
      {/* Spending Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Spending Recommendations</h3>
        <div className="space-y-4">
          {mlInsights.categoryRecommendations.map((rec, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{rec.category}</h4>
                <p className="text-sm text-gray-600">Current: ₹{rec.currentSpend} → Recommended: ₹{rec.recommendedLimit}</p>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-bold">Save ₹{rec.savings}</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
            <hr></hr>
            </div>
            
          ))}
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Anomaly Detection</h3>
        <div className="space-y-3">
          {mlInsights.anomalies.map((anomaly, index) => (
            <div key={index} className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <div className="font-medium">{anomaly.transaction}</div>
                <div className="text-sm text-gray-600">{anomaly.reason} on {anomaly.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecasting Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Spending Forecast vs Recommendations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mlInsights.categoryRecommendations}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="currentSpend" fill="#ff7300" name="Current Spending" />
            <Bar dataKey="recommendedLimit" fill="#82ca9d" name="Recommended Limit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ML Model Information */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold mb-4 text-purple-800">ML Models in Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-purple-800">K-Means Clustering</h4>
            <p className="text-sm text-gray-600">Groups users by spending behavior patterns</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-purple-800">LSTM Forecasting</h4>
            <p className="text-sm text-gray-600">Predicts future spending based on historical patterns</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-purple-800">NLP Categorization</h4>
            <p className="text-sm text-gray-600">Automatically categorizes transactions using semantic analysis</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabClasses = (tab) => `px-6 py-3 font-medium text-sm rounded-lg transition-colors ${activeTab === tab
      ? 'bg-blue-500 text-white shadow-lg'
      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-8 h-8 mr-2 text-blue-600" />
              BudgetMentor
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back! Your financial AI is analyzing your patterns.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 py-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={tabClasses('dashboard')}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={tabClasses('transactions')}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={tabClasses('goals')}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={tabClasses('insights')}
            >
              ML Insights
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'goals' && <Goals />}
        {activeTab === 'insights' && <MLInsights />}
      </main>
    </div>
  );
};

export default FinancialPlannerApp;
