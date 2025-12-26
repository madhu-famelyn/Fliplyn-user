import React, { useEffect, useState } from 'react';
import './TransactionHistory.css';
import Header from '../Header/Header';
import axios from 'axios';
import { useAuth } from '../../AuthContext/ContextApi';
import Footer from '../Footer/Footer';
import walletImg from '../../../assets/Images/wallet image.png';
import noTxnImg from '../../../assets/Images/no transactions images.png';

axios.defaults.baseURL = 'https://admin-aged-field-2794.fly.dev';

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
        setHistory(historyRes.data || []);
      } catch (error) {
        console.error('Error fetching wallet data', error);
      }
    }

    fetchWalletData();
  }, [user]);

  return (
    <>
      <Header />

      <div className="wallet-page">
        {/* WALLET CARD */}
        <div className="wallet-card">
          <div className="wallet-left">
            <img src={walletImg} alt="Wallet" />
          </div>

          <div className="wallet-right">
            <p className="wallet-label">Wallet Balance</p>
            <h2 className="wallet-amount">₹ {walletBalance.toFixed(2)}</h2>
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <h3 className="txn-title">Transaction History</h3>

        {history.length === 0 ? (
          <div className="empty-txn">
            <img src={noTxnImg} alt="No Transactions" />
            <p>No transactions yet.</p>
          </div>
        ) : (
          <ul className="transaction-list">
            {history.map((entry, index) => {
              const isCredit = entry.amount > 0;
              const amount = Math.abs(entry.amount);

              return (
                <li key={index} className="transaction-item">
                  <div>
                    <p className="txn-text">
                      {isCredit ? 'Money Added' : 'Order Payment'}
                    </p>
                    <span className="txn-date">
                      {new Date(entry.date).toLocaleString('en-GB')}
                    </span>
                  </div>

                  <div className={`txn-amount ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? `+ ₹${amount}` : `- ₹${amount}`}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Footer/>
    </>
  );
}
