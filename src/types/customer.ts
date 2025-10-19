// Customer and CRM types
export type CustomerStatus = 'active' | 'inactive' | 'vip' | 'blacklisted';
export type CustomerType = 'regular' | 'vip' | 'corporate' | 'new';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface CustomerPreferences {
  preferredTable?: string;
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteItems: number[];
  spiceLevel: 1 | 2 | 3 | 4 | 5;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}

export interface LoyaltyProgram {
  memberId: string;
  tier: LoyaltyTier;
  points: number;
  totalSpent: number;
  joinDate: string;
  lastActivity: string;
  benefits: string[];
  nextTierThreshold?: number;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  status: CustomerStatus;
  type: CustomerType;
  addresses: CustomerAddress[];
  preferences: CustomerPreferences;
  loyaltyProgram?: LoyaltyProgram;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastVisit?: string;
  registrationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerVisit {
  id: number;
  customerId: number;
  visitDate: string;
  tableId?: number;
  partySize: number;
  orderId?: number;
  totalSpent: number;
  duration: number; // in minutes
  rating?: number;
  feedback?: string;
  serverName?: string;
}

// Form data interfaces
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  status: CustomerStatus;
  type: CustomerType;
  notes?: string;
  addresses?: CustomerAddress[];
  preferences?: Partial<CustomerPreferences>;
}

export interface CustomerAddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface LoyaltyProgramFormData {
  memberId?: string;
  tier: LoyaltyTier;
  points?: number;
  benefits: string[];
}

// Filter and search interfaces
export interface CustomerFilters {
  status?: CustomerStatus;
  type?: CustomerType;
  loyaltyTier?: LoyaltyTier;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastVisitFrom?: string;
  lastVisitTo?: string;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  city?: string;
  state?: string;
  hasLoyalty?: boolean;
  searchTerm?: string;
}

export interface CustomerVisitFilters {
  customerId?: number;
  visitDateFrom?: string;
  visitDateTo?: string;
  tableId?: number;
  minSpent?: number;
  maxSpent?: number;
  minRating?: number;
  maxRating?: number;
  serverName?: string;
}

// Analytics interfaces
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  vipCustomers: number;
  activeCustomers: number;
  averageLifetimeValue: number;
  customerRetentionRate: number;
  averageVisitFrequency: number;
  topCustomers: {
    customerId: number;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastVisit: string;
  }[];
}

export interface CustomerSegmentation {
  segment: string;
  customerCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  visitFrequency: number;
  characteristics: string[];
}

// API response interfaces
export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerVisitsResponse {
  visits: CustomerVisit[];
  total: number;
  page: number;
  limit: number;
}

// Create/Update request interfaces
export interface CreateCustomerRequest extends Omit<CustomerFormData, 'id'> {}
export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: number;
}

export interface CreateCustomerVisitRequest {
  customerId: number;
  visitDate: string;
  tableId?: number;
  partySize: number;
  orderId?: number;
  totalSpent: number;
  duration: number;
  rating?: number;
  feedback?: string;
  serverName?: string;
}

export interface UpdateCustomerVisitRequest extends Partial<CreateCustomerVisitRequest> {
  id: number;
}