import React, { useEffect, useState } from 'react';
import './TransactionHistory.css';
import Header from '../Header/Header';
import axios from 'axios';
import { useAuth } from '../../AuthContext/ContextApi';

axios.defaults.baseURL = 'http://localhost:8000'; // ✅ API base URL

export default function TransactionHistory() {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchWalletData() {
      try {
        const walletRes = await axios.get(`/wallets/${user.id}`);
        const historyRes = await axios.get(`/wallets/${user.id}/history`);

        setWalletBalance(walletRes.data.balance_amount || 0);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Error fetching wallet data', error);
      }
    }

    fetchWalletData();
  }, [user]);

  return (
    <>
      <Header />
      <div className="transaction-container">
        <div className="wallet-balance-section">
          <h2 className="wallet-title">Wallet</h2>
          <p className="wallet-balance">₹ {walletBalance}</p>
          <button className="add-money-btn">Add Money</button>
        </div>

        <div className="transaction-history-section">
          <h3 className="transaction-title">Transaction History</h3>
          {history.length === 0 ? (
            <p className="no-history">No transactions found.</p>
          ) : (
            <ul className="transaction-list">
              {history.map((entry, index) => {
                const isCredit = entry.amount > 0;
                const amount = Math.abs(entry.amount);

                return (
                  <li key={index} className="transaction-item">
                    <div className="transaction-info">
                      <p className="transaction-label">
                        {isCredit ? 'Money Added' : 'Order Payment'}
                      </p>
                      <p className="transaction-date">
                        {new Date(entry.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`transaction-amount ${isCredit ? 'credit' : 'debit'}`}>
                      {isCredit ? `+ ₹${amount}` : `- ₹${amount}`}
                      <p className="transaction-type-text">
                        {isCredit ? 'Credited' : 'Debited'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
