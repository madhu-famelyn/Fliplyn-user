import React, { useEffect, useState } from 'react';
import './TransactionHistory.css';
import Header from '../Header/Header';
import axios from 'axios';
import { useAuth } from '../../AuthContext/ContextApi';
import Footer from '../Footer/Footer';
import walletImg from '../../../assets/Images/wallet image.png';
import noTxnImg from '../../../assets/Images/no transactions images.png';

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.startsWith("172.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:8000`
  : "https://admin-aged-field-2794.fly.dev";

export default function TransactionHistory() {
  const { user, token } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchWalletData() {
      try {
        setLoading(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const walletRes = await axios.get(`${API_BASE}/wallets/${user.id}`, { headers });
        const historyRes = await axios.get(`${API_BASE}/wallets/${user.id}/history`, { headers });

        setWalletBalance(walletRes.data?.balance_amount || 0);
        setHistory(historyRes.data || []);
      } catch (error) {
        console.error('Error fetching wallet data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWalletData();
  }, [user, token]);

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

        {loading ? (
          <p className="txn-loading" style={{ textAlign: "center", color: "#64748b", margin: "30px 0" }}>Loading transactions...</p>
        ) : history.length === 0 ? (
          <div className="empty-txn">
            <img src={noTxnImg} alt="No Transactions" />
            <p>No transactions yet.</p>
          </div>
        ) : (
          <ul className="transaction-list">
            {history.map((entry, index) => {
              const isCredit = entry.amount > 0;
              const amount = Math.abs(entry.amount || entry.raw_amount || 0);
              const title =
                entry.description ||
                (isCredit
                  ? entry.source === "SELF_LOAD"
                    ? "Wallet Top-up via PhonePe"
                    : "Money Added"
                  : "Order Payment");

              return (
                <li key={entry.id || index} className="transaction-item">
                  <div>
                    <p className="txn-text" style={{ fontWeight: 600, color: "#1e293b" }}>
                      {title}
                    </p>
                    <span className="txn-date" style={{ fontSize: "12px", color: "#64748b" }}>
                      {new Date(entry.date).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className={`txn-amount ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? `+ ₹${amount.toFixed(2)}` : `- ₹${amount.toFixed(2)}`}
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
