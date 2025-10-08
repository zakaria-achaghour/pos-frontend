import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { restaurantAPI } from '../../api/restaurants';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  cover_image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: Record<string, string[]>;
}

const initialState: RestaurantState = {
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
  successMessage: null,
  validationErrors: {},
};

// Async thunks
export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching restaurants from API...');
      const response = await restaurantAPI.getRestaurants();
      console.log('✅ Restaurants API Response:', response);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching restaurants:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurant = createAsyncThunk(
  'restaurant/fetchRestaurant',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching restaurant details for ID:', id);
      const restaurant = await restaurantAPI.getRestaurant(id);
      console.log('✅ Restaurant details:', restaurant);
      return restaurant;
    } catch (error: any) {
      console.error('❌ Error fetching restaurant:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant');
    }
  }
);

export const createRestaurant = createAsyncThunk(
  'restaurant/createRestaurant',
  async (restaurantData: any, { rejectWithValue }) => {
    try {
      console.log('➕ Creating new restaurant:', restaurantData);
      const restaurant = await restaurantAPI.createRestaurant(restaurantData);
      console.log('✅ Restaurant created:', restaurant);
      return restaurant;
    } catch (error: any) {
      console.error('❌ Error creating restaurant:', error);
      if (error.response?.data?.errors) {
        return rejectWithValue({ 
          errors: error.response.data.errors, 
          message: error.response.data.message 
        });
      }
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Failed to create restaurant' 
      });
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  'restaurant/updateRestaurant',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating restaurant:', id, data);
      const restaurant = await restaurantAPI.updateRestaurant(id, data);
      console.log('✅ Restaurant updated:', restaurant);
      return restaurant;
    } catch (error: any) {
      console.error('❌ Error updating restaurant:', error);
      if (error.response?.data?.errors) {
        return rejectWithValue({ 
          errors: error.response.data.errors, 
          message: error.response.data.message 
        });
      }
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Failed to update restaurant' 
      });
    }
  }
);

export const deleteRestaurant = createAsyncThunk(
  'restaurant/deleteRestaurant',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting restaurant:', id);
      await restaurantAPI.deleteRestaurant(id);
      return id;
    } catch (error: any) {
      console.error('❌ Error deleting restaurant:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete restaurant');
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSelectedRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.selectedRestaurant = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single restaurant
      .addCase(fetchRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create restaurant
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
        state.validationErrors = {};
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants.push(action.payload);
        state.successMessage = 'Restaurant created successfully!';
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload.errors) {
          state.validationErrors = payload.errors;
          state.error = payload.message || 'Validation errors occurred';
        } else {
          state.error = payload.message || 'Failed to create restaurant';
        }
      })
      // Update restaurant
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
        state.validationErrors = {};
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.restaurants.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
        if (state.selectedRestaurant?.id === action.payload.id) {
          state.selectedRestaurant = action.payload;
        }
        state.successMessage = 'Restaurant updated successfully!';
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload.errors) {
          state.validationErrors = payload.errors;
          state.error = payload.message || 'Validation errors occurred';
        } else {
          state.error = payload.message || 'Failed to update restaurant';
        }
      })
      // Delete restaurant
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = state.restaurants.filter(r => r.id !== action.payload);
        if (state.selectedRestaurant?.id === action.payload) {
          state.selectedRestaurant = null;
        }
        state.successMessage = 'Restaurant deleted successfully!';
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectRestaurant = (state: { restaurant: RestaurantState }) => state.restaurant;
export const selectRestaurants = (state: { restaurant: RestaurantState }) => state.restaurant.restaurants;
export const selectSelectedRestaurant = (state: { restaurant: RestaurantState }) => state.restaurant.selectedRestaurant;
export const selectRestaurantLoading = (state: { restaurant: RestaurantState }) => state.restaurant.loading;
export const selectRestaurantError = (state: { restaurant: RestaurantState }) => state.restaurant.error;
export const selectRestaurantSuccessMessage = (state: { restaurant: RestaurantState }) => state.restaurant.successMessage;
export const selectRestaurantValidationErrors = (state: { restaurant: RestaurantState }) => state.restaurant.validationErrors;

export const {
  clearError,
  clearSuccessMessage,
  setSelectedRestaurant,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;