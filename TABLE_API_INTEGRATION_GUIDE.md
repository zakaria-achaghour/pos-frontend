# Table Management API Integration Guide

This document explains the implementation of the integrated Table Management system that connects with the backend API.

## 🚀 Features Implemented

### 1. **Full CRUD Operations**
- **Create Tables**: Add new tables with complete details (number, capacity, shape, location, features)
- **Read Tables**: List tables with pagination and advanced filtering
- **Update Tables**: Edit table information and status
- **Delete Tables**: Remove tables (with safety checks for occupied tables)

### 2. **Real-time Status Management**
- **Available** ✅ - Ready for guests
- **Occupied** 🔴 - Currently serving customers  
- **Reserved** 🟡 - Upcoming reservations
- **Cleaning** 🧽 - Being cleaned between guests
- **Out-of-Order** ⚠️ - Temporarily unavailable
- **Maintenance** 🔧 - Under repair

### 3. **Advanced Filtering System**
- **Search**: By table number, section name
- **Status Filter**: Filter by any table status
- **Shape Filter**: Round, square, rectangular tables
- **Capacity Range**: Min/max seat filtering
- **Location**: Section and floor filtering
- **Active Filters Display**: Visual chips showing applied filters

### 4. **Bulk Operations**
- **Multi-select**: Select multiple tables for bulk actions
- **Bulk Activate/Deactivate**: Change status of multiple tables
- **Select All**: Quick selection of visible tables

### 5. **Real-time Statistics**
- **Total Tables**: Complete table count
- **Occupancy Rate**: Live percentage of occupied tables
- **Status Distribution**: Visual breakdown of table statuses
- **Capacity Metrics**: Total seating capacity
- **Quick Insights**: Smart alerts and recommendations

## 🔧 API Integration Details

### **Table API Endpoints Used**

```typescript
// GET /api/tables - List tables with pagination and filters
GET /api/tables?page=1&limit=10&status=available&capacity=4

// POST /api/tables - Create new table
POST /api/tables
{
  "number": "T-01",
  "capacity": 4,
  "shape": "rectangular",
  "status": "available", 
  "section": "Main Hall",
  "floor": 1,
  "description": "Window table with great view",
  "features": ["Window View", "Wheelchair Accessible"]
}

// GET /api/tables/{id} - Get specific table
GET /api/tables/123

// PUT /api/tables/{id} - Update table
PUT /api/tables/123
{
  "number": "T-01A",
  "capacity": 6,
  "description": "Updated description"
}

// DELETE /api/tables/{id} - Delete table  
DELETE /api/tables/123

// PATCH /api/tables/{id}/status - Update status only
PATCH /api/tables/123/status
{
  "status": "occupied"
}
```

### **Error Handling**
- **Network Errors**: Graceful handling with user-friendly messages
- **Validation Errors**: Display server validation messages
- **Conflict Prevention**: Check for occupied tables before deletion
- **Loading States**: Visual feedback during API operations

## 📱 Components Architecture

### **Hook: useTableManagement**
```typescript
const {
  // Data
  tables, filteredTables, tableStats, pagination,
  
  // Loading States  
  loading, creating, updating, deleting,
  
  // Actions
  createTable, updateTable, deleteTable, 
  updateTableStatus, deactivateTable, activateTable,
  
  // Filtering
  updateFilters, resetFilters,
  
  // Helpers
  getTableById, getStatusColor, getShapeIcon
} = useTableManagement();
```

### **Main Components**
- **TableManagementIntegrated**: Main page component
- **TableList**: Grid/list view of tables  
- **TableCard**: Individual table display card
- **TableForm**: Create/edit table form with validation
- **TableFilters**: Advanced filtering interface
- **TableStats**: Real-time statistics dashboard

## 🎯 Usage Examples

### **Basic Usage**
```typescript
import TableManagementIntegrated from '../pages/table-management';

// Simply use the component
<TableManagementIntegrated />
```

### **Programmatic Table Operations**
```typescript
// Create a new table
await createTable({
  number: 'VIP-01',
  capacity: 8,
  shape: 'rectangular',
  status: 'available',
  section: 'VIP Area',
  floor: 2,
  features: ['Private Booth', 'Premium Service']
});

// Update table status
await updateTableStatus(tableId, 'occupied');

// Bulk deactivate tables
const selectedIds = [1, 2, 3];
await Promise.all(selectedIds.map(id => deactivateTable(id)));
```

### **Advanced Filtering**
```typescript
// Apply complex filters
updateFilters({
  searchTerm: 'VIP',
  status: 'available', 
  minCapacity: 4,
  maxCapacity: 8,
  section: 'Main Hall',
  floor: 1
});

// Reset all filters
resetFilters();
```

## 🔄 Real-time Features

### **Auto-refresh**
- Tables reload automatically when filters change
- Live updates when table status changes
- Real-time statistics updates

### **Optimistic Updates**
- Immediate UI feedback for status changes
- Rollback on API errors
- Loading states for better UX

## 🎨 UI/UX Features

### **Responsive Design**
- Mobile-friendly table cards
- Adaptive grid/list layouts  
- Touch-friendly controls

### **Dark Mode Support**
- Complete dark theme compatibility
- Proper contrast ratios
- Consistent styling

### **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- ARIA labels and descriptions
- Focus management

## 🚨 Safety Features

### **Data Validation**
- Client-side form validation with Yup
- Server-side error handling
- Prevent deletion of occupied tables
- Duplicate table number detection

### **User Confirmations**
- Delete confirmations
- Bulk action confirmations  
- Clear action feedback

## 📊 Performance Optimizations

### **Efficient Loading**
- Pagination for large table lists
- Lazy loading of table details
- Optimized API calls

### **Smart Caching**
- Client-side table state management
- Reduced redundant API calls
- Quick filter responses

## 🔮 Future Enhancements

### **Planned Features**
- Real-time WebSocket updates
- Table layout visual editor
- Reservation integration
- Order tracking integration
- Analytics dashboard
- Export/import functionality

### **API Extensibility**
- Ready for additional endpoints
- Modular architecture
- Easy feature additions

---

## 🛠️ Development Notes

### **File Structure**
```
src/
├── pages/table-management/
│   ├── TableManagementIntegrated.tsx  # Main page
│   └── index.tsx                      # Export
├── hooks/
│   └── useTableManagement.ts          # API integration hook
├── components/tables/
│   ├── TableList.tsx                  # Table grid/list
│   ├── TableCard.tsx                  # Individual table card
│   ├── TableForm.tsx                  # Create/edit form
│   ├── TableFilters.tsx               # Advanced filters
│   └── TableStats.tsx                 # Statistics dashboard
├── api/
│   └── tables.ts                      # API service functions
└── types/
    └── table.ts                       # TypeScript interfaces
```

### **Key Dependencies**
- **Formik + Yup**: Form handling and validation
- **React Hooks**: State management and effects
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Responsive styling

This implementation provides a complete, production-ready table management system with full API integration, real-time updates, and an excellent user experience.