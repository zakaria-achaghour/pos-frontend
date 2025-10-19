// Restaurant and business types
export type RestaurantStatus = 'active' | 'inactive' | 'maintenance' | 'closed';
export type CuisineType = 'italian' | 'mexican' | 'chinese' | 'indian' | 'american' | 'french' | 'japanese' | 'mediterranean' | 'thai' | 'other';
export type ServiceType = 'dine-in' | 'takeout' | 'delivery' | 'catering';

export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface RestaurantAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RestaurantSettings {
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  taxRate: number;
  serviceChargeRate: number;
  allowTips: boolean;
  defaultTipPercentages: number[];
  requireReservations: boolean;
  maxPartySize: number;
  reservationAdvanceDays: number;
  cancellationPolicy: string;
  loyaltyProgram: {
    enabled: boolean;
    pointsPerDollar: number;
    redemptionRate: number;
  };
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  status: RestaurantStatus;
  cuisineType: CuisineType[];
  serviceTypes: ServiceType[];
  address: RestaurantAddress;
  contactInfo: ContactInfo;
  businessHours: BusinessHours[];
  settings: RestaurantSettings;
  capacity: number;
  tableCount: number;
  staffCount: number;
  averageRating: number;
  totalReviews: number;
  logo?: string;
  images: string[];
  features: string[];
  amenities: string[];
  ownerId: number;
  managerId?: number;
  licenseNumber: string;
  taxId: string;
  establishedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantBranch {
  id: number;
  parentRestaurantId: number;
  name: string;
  address: RestaurantAddress;
  contactInfo: ContactInfo;
  managerId: number;
  status: RestaurantStatus;
  capacity: number;
  tableCount: number;
  staffCount: number;
  openingDate: string;
}

// Form data interfaces
export interface RestaurantFormData {
  name: string;
  description: string;
  cuisineType: CuisineType[];
  serviceTypes: ServiceType[];
  address: RestaurantAddress;
  contactInfo: ContactInfo;
  businessHours: BusinessHours[];
  capacity: number;
  features: string[];
  amenities: string[];
  licenseNumber: string;
  taxId: string;
  establishedDate: string;
  logo?: string;
  images?: string[];
}

export interface RestaurantSettingsFormData {
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  taxRate: number;
  serviceChargeRate: number;
  allowTips: boolean;
  defaultTipPercentages: number[];
  requireReservations: boolean;
  maxPartySize: number;
  reservationAdvanceDays: number;
  cancellationPolicy: string;
  loyaltyProgram: {
    enabled: boolean;
    pointsPerDollar: number;
    redemptionRate: number;
  };
}

export interface BusinessHoursFormData {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

// Filter and search interfaces
export interface RestaurantFilters {
  status?: RestaurantStatus;
  cuisineType?: CuisineType;
  serviceTypes?: ServiceType[];
  city?: string;
  state?: string;
  country?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minRating?: number;
  maxRating?: number;
  features?: string[];
  amenities?: string[];
  ownerId?: number;
  searchTerm?: string;
}

// Analytics interfaces
export interface RestaurantAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  tableUtilization: number;
  staffEfficiency: number;
  popularDishes: {
    name: string;
    orderCount: number;
    revenue: number;
  }[];
  peakHours: {
    hour: number;
    orderCount: number;
    revenue: number;
  }[];
  monthlyTrends: {
    month: string;
    revenue: number;
    orders: number;
    customers: number;
  }[];
}

export interface RestaurantPerformance {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  orders: {
    completed: number;
    cancelled: number;
    pending: number;
    averageValue: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    satisfaction: number;
  };
  staff: {
    totalStaff: number;
    activeStaff: number;
    efficiency: number;
    satisfaction: number;
  };
}

// API response interfaces
export interface RestaurantsResponse {
  restaurants: Restaurant[];
  total: number;
  page: number;
  limit: number;
}

export interface RestaurantBranchesResponse {
  branches: RestaurantBranch[];
  total: number;
  page: number;
  limit: number;
}

// Create/Update request interfaces
export interface CreateRestaurantRequest extends Omit<RestaurantFormData, 'id'> {}
export interface UpdateRestaurantRequest extends Partial<CreateRestaurantRequest> {
  id: number;
}

export interface CreateRestaurantBranchRequest {
  parentRestaurantId: number;
  name: string;
  address: RestaurantAddress;
  contactInfo: ContactInfo;
  managerId: number;
  capacity: number;
  openingDate: string;
}

export interface UpdateRestaurantBranchRequest extends Partial<CreateRestaurantBranchRequest> {
  id: number;
}