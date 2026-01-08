import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// GET all subscriptions from backend
export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetch",
  async () => {
    // Always fetch from server — source of truth
    const res = await fetch('/api/subscriptions');
    return res.json();
  }
);

// POST - add new active subscription
export const addSubscription = createAsyncThunk(
  "subscriptions/add",
  async (_, { rejectWithValue }) => {
    try {    
      // Server returns the created subscription
      const res = await fetch('/api/subscriptions', { method: "POST" });
      return res.json();
    } catch (err) {
      return rejectWithValue("Unable to add subscription");
    }
  }
);

// PATCH: Cancel one active subscription
export const cancelSubscription = createAsyncThunk(
  "subscriptions/cancel",
  async (_, { rejectWithValue }) => {
    try {
    // Server cancels *first active* subscription — unpredictable which one.
    // No ID support. UI must always re-fetch after calling this.
      const res = await fetch('/api/subscriptions', { method: "PATCH" });
      return res.json();
    } catch (err) {
      return rejectWithValue("Unable to cancel subscription");
    }
  }
);

type Subscription = {
  id: string;
  status: 'active' | 'cancelled';
};

type SubscriptionsState = {
  data: Subscription[];
  loading: boolean;
  activeCount: number;
};

const initialState: SubscriptionsState = {
  data: [],
  loading: false,
  activeCount: 0
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Loading state while waiting for server data
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
      })
      // Replace local state with server state to avoid drift
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.data = action.payload;
        // Recalculate count instead of relying on local mutations
        state.activeCount = action.payload.filter(
          (s: Subscription) => s.status === 'active'
        ).length;
        state.loading = false;
      })
      .addCase(addSubscription.fulfilled, (state) => {})
      .addCase(cancelSubscription.fulfilled, (state) => {});
  }
});

export default subscriptionsSlice.reducer;
