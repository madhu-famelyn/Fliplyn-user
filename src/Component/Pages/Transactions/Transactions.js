import React, { useEffect, useState } from 'react';
import { getOrderDetailsByUserId } from './Service';
import { useAuth } from '../../AuthContext/ContextApi';
import Header from '../Header/Header';
import './Transactions.css';

export default function Transactions() {
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getOrderDetailsByUserId(userId)
        .then((data) => {
          setOrders(data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching orders:', err);
          setLoading(false);
        });
    }
  }, [userId]);

  return (
    <>
      <Header />
      <div className="transactions-wrapper">
        {loading ? (
          <p className="transactions-loading">Loading transactions...</p>
        ) : !orders.length ? (
          <p className="transactions-empty">No transactions found.</p>
        ) : (
          <div className="transactions-container">
            <h2 className="transaction-title">Transaction History</h2>
            <div className="transaction-table">
              <div className="transaction-header">
                <span>Date</span>
                <span>Order ID</span>
                <span>Amount</span>
                <span>Payment Method</span>
                <span>Status</span>
              </div>

              {orders.map((order) => (
                <div key={order.id} className="transaction-row">
                  <span>
                    {new Date(order.created_datetime).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>#{order.id.slice(-5)}</span>
                  <span>₹{order.total_amount}</span>
                  <span>{order.payment_method_detail || 'Wallet'}</span>
                  <span className="status success">Successful</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
