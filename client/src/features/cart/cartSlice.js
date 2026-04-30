import { createSlice } from '@reduxjs/toolkit';

const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
const initialCartKey = user ? `cartItems_${user._id}` : 'cartItems_guest';

const initialState = {
  cartItems: localStorage.getItem(initialCartKey) ? JSON.parse(localStorage.getItem(initialCartKey)) : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
  cartKey: initialCartKey,
};

const calculateTotals = (state) => {
  let { total, quantity } = state.cartItems.reduce(
    (cartTotal, cartItem) => {
      const { pricePerUnit, cartQuantity } = cartItem;
      const itemTotal = pricePerUnit * cartQuantity;
      cartTotal.total += itemTotal;
      cartTotal.quantity += cartQuantity;
      return cartTotal;
    },
    { total: 0, quantity: 0 }
  );
  state.cartTotalQuantity = quantity;
  state.cartTotalAmount = total;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) => item._id === action.payload._id
      );

      const isWeight = action.payload.sellingType === "weight";
      const step = isWeight ? 0.25 : 1;
      const quantityToAdd = action.payload.selectedQuantity ? Number(action.payload.selectedQuantity) : step;

      if (itemIndex >= 0) {
        state.cartItems[itemIndex].cartQuantity = Number(
          (state.cartItems[itemIndex].cartQuantity + quantityToAdd).toFixed(2)
        );
      } else {
        const tempProduct = { ...action.payload, cartQuantity: quantityToAdd };
        delete tempProduct.selectedQuantity;
        state.cartItems.push(tempProduct);
      }
      localStorage.setItem(state.cartKey, JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    removeFromCart(state, action) {
      const nextCartItems = state.cartItems.filter(
        (cartItem) => cartItem._id !== action.payload._id
      );
      state.cartItems = nextCartItems;
      localStorage.setItem(state.cartKey, JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    decreaseCart(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (cartItem) => cartItem._id === action.payload._id
      );

      const isWeight = action.payload.sellingType === "weight";
      const step = isWeight ? 0.25 : 1;
      const minQty = isWeight ? 0.25 : 1;

      if (state.cartItems[itemIndex].cartQuantity > minQty) {
        state.cartItems[itemIndex].cartQuantity = Number(
          (state.cartItems[itemIndex].cartQuantity - step).toFixed(2)
        );
      } else if (state.cartItems[itemIndex].cartQuantity <= minQty) {
        const nextCartItems = state.cartItems.filter(
          (cartItem) => cartItem._id !== action.payload._id
        );
        state.cartItems = nextCartItems;
      }
      localStorage.setItem(state.cartKey, JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    updateQuantity(state, action) {
      const { _id, quantity } = action.payload;
      const itemIndex = state.cartItems.findIndex((item) => item._id === _id);
      if (itemIndex >= 0) {
        const item = state.cartItems[itemIndex];
        const isWeight = item.sellingType === "weight";
        const minQty = isWeight ? 0.25 : 1;
        
        let validQty = Number(quantity);
        if (isNaN(validQty) || validQty < minQty) validQty = minQty;
        
        state.cartItems[itemIndex].cartQuantity = Number(validQty.toFixed(2));
        localStorage.setItem(state.cartKey, JSON.stringify(state.cartItems));
        calculateTotals(state);
      }
    },
    clearCart(state) {
      state.cartItems = [];
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    getTotals(state) {
      calculateTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase('auth/setCredentials', (state, action) => {
      const user = action.payload.user;
      const newCartKey = `cartItems_${user._id}`;
      
      const newStorageItems = localStorage.getItem(newCartKey) 
        ? JSON.parse(localStorage.getItem(newCartKey)) 
        : [];
        
      if (state.cartKey === 'cartItems_guest' && state.cartItems.length > 0) {
        state.cartItems.forEach(guestItem => {
          const existingItemIndex = newStorageItems.findIndex(i => i._id === guestItem._id);
          if (existingItemIndex >= 0) {
            newStorageItems[existingItemIndex].cartQuantity += guestItem.cartQuantity;
          } else {
            newStorageItems.push(guestItem);
          }
        });
        localStorage.removeItem('cartItems_guest');
      }

      state.cartKey = newCartKey;
      state.cartItems = newStorageItems;
      localStorage.setItem(newCartKey, JSON.stringify(state.cartItems));
      calculateTotals(state);
    });

    builder.addCase('auth/logOut', (state) => {
      state.cartKey = 'cartItems_guest';
      state.cartItems = localStorage.getItem('cartItems_guest') 
        ? JSON.parse(localStorage.getItem('cartItems_guest')) 
        : [];
      calculateTotals(state);
    });
  }
});

export const { addToCart, removeFromCart, decreaseCart, updateQuantity, clearCart, getTotals } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotalQuantity = (state) => state.cart.cartTotalQuantity;
export const selectCartTotalAmount = (state) => state.cart.cartTotalAmount;

export default cartSlice.reducer;
