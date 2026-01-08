'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import { fetchSubscriptions, addSubscription, cancelSubscription } from '../store/subscriptionsSlice';

export const SubscriptionsTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, activeCount, loading } = useSelector(
    (state: any) => state.subscriptions
  );

  useEffect(() => {
    // Load subscriptions from server on mount
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h3>Active subscriptions: {activeCount}</h3>

      <button
        onClick={async () => {
          await dispatch(addSubscription());
          dispatch(fetchSubscriptions());
        }}
        style={{ marginBottom: '16px' }}
      >
        ➕ Add subscription
      </button>

      <ul>
        {data.map((s: any) => (
          <li key={s.id}>{s.id} — {s.status}
            {s.status === 'active' && (
              <button
                onClick={() => {
                  dispatch(cancelSubscription()).then(() => dispatch(fetchSubscriptions()));
                }}
              >
                Cancel One Active Subscription
              </button>
            )}</li>
        ))}
      </ul>
    </>
  );
};
