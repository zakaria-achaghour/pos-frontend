# Quick Start Guide - Menu Items Management

## 🚀 Getting Started

### 1. Access the Page
Navigate to: **`http://localhost:5173/items`**

Login required with role: **Owner** or **Manager**

### 2. Navigation
**Sidebar** → Menu → Items

---

## 📋 Quick Actions

### Create New Item
1. Click **"Add New Item"** button (top right of filters)
2. Fill in required fields:
   - Name *
   - Price *
   - Category *
3. Optional: Add description, ingredients, allergens, prep time, cost
4. Toggle Active/Available checkboxes
5. Click **"Create Item"**

### Edit Item
1. Find item in grid
2. Click **"✏️ Edit"** button
3. Modify fields
4. Click **"Update Item"**

### Delete Item
1. Find item in grid
2. Click **"🗑️ Delete"** button
3. Confirm deletion

### Toggle Status
- Click **"🚫 Deactivate"** or **"✅ Activate"**
- Inactive items won't show in POS

### Toggle Availability
- Click **"📦 Out"** or **"✅ Stock"**
- Out of stock items can't be ordered

### Upload Image
1. Click camera icon (📷) on item card
2. Select image file (max 5MB)
3. Wait for success message

---

## 🔍 Filtering

### Search
Type in search box → auto-searches after 500ms

### Category Filter
Select category from dropdown → immediate filter

### Status Filter
- All Status
- Active
- Inactive

### Availability Filter
- All Items
- Available  
- Unavailable (Out of Stock)

### Reset Filters
Click **"Reset Filters"** button → clears all

---

## 📄 Pagination

### Navigation
- **Previous** / **Next** buttons
- Click page numbers
- Automatic ellipsis (...) for many pages

### Items Per Page
Select: 10 / 20 / 50 / 100 (default: 12)

### Info Display
Shows: "Showing 1 to 12 of 45 results"

---

## 📊 Statistics Dashboard

Top of page shows:
- **Total Items** - All items in database
- **Active** - Currently active items
- **Available** - Currently in stock
- **Categories** - Total categories

---

## ✅ Form Validation

### Required Fields
- **Name** (2-100 characters)
- **Price** (0.01 - 99,999.99 MAD)
- **Category** (must select)

### Optional Fields
- Description (max 500 chars)
- Cost (shows margin if provided)
- Preparation Time (1-480 minutes)
- Ingredients (comma-separated)
- Allergens (comma-separated)
- Sort Order (number)

### Checkboxes
- **Active** - Show in menu
- **Available** - Can be ordered

---

## 💡 Tips & Tricks

### 1. Profit Margin
Add **Cost** to see profit margin % automatically calculated

### 2. Quick Search
Use search for fastest results - searches name and description

### 3. Bulk Status Change
Filter items first, then toggle status on each

### 4. Image Requirements
- Format: JPG, PNG, GIF, WebP
- Max size: 5MB
- Recommended: Square images (500x500px)

### 5. Ingredients/Allergens
- Use commas to separate items
- Example: `Chicken breast, Olive oil, Herbs`
- Shows count below input

### 6. Preparation Time
- Enter minutes only
- Example: 25 = 25 minutes
- Helps kitchen planning

---

## 🔴 Error Messages

### "Failed to create menu item"
→ Check all required fields are filled

### "Image size must be less than 5MB"
→ Compress image before uploading

### "Please select a valid image file"
→ Only image formats accepted (JPG, PNG, etc.)

### "Failed to fetch menu items"
→ Check internet connection or API server

### "This item may be in active orders"
→ Can't delete items currently in orders

---

## ⌨️ Keyboard Shortcuts

- **Tab** - Navigate form fields
- **Enter** - Submit form (when focused on button)
- **Esc** - Close modal
- **Ctrl+F** - Focus search box (browser default)

---

## 📱 Mobile View

### Grid Layout
- Mobile: 1 column
- Tablet: 2 columns  
- Desktop: 3 columns

### Touch Gestures
- Tap to open modals
- Scroll to navigate
- Pinch to zoom images

---

## 🎨 Visual Indicators

### Status Badges
- 🟢 **Green** = Active
- 🔴 **Red** = Inactive

### Availability Badges
- 🔵 **Blue** = Available
- ⚫ **Gray** = Out of Stock

### Price Colors
- 🟢 **Green** = Low price (< 50 MAD)
- 🟡 **Yellow** = Medium price (50-150 MAD)
- 🔴 **Red** = High price (> 150 MAD)

### Allergen Warning
- ⚠️ **Red** indicator when allergens present

---

## 🐛 Troubleshooting

### Problem: Items not loading
**Solution:**
1. Check internet connection
2. Refresh page (F5)
3. Check browser console (F12)
4. Verify logged in with correct role

### Problem: Can't upload image
**Solution:**
1. Check file is an image
2. Check file size < 5MB
3. Try different image format
4. Check browser console for errors

### Problem: Pagination not showing
**Solution:**
1. Check if items > page size
2. Try changing items per page
3. Clear filters and try again

### Problem: Search not working
**Solution:**
1. Wait 500ms after typing
2. Check if loading spinner appears
3. Try clearing search and re-entering

### Problem: Can't create item
**Solution:**
1. Check all required fields (*)
2. Verify price is valid number
3. Make sure category is selected
4. Check for validation errors

---

## 📞 Need Help?

1. **Check Console:** Press F12 → Console tab
2. **Check Network:** F12 → Network tab → Filter by "items"
3. **Review Guide:** See `MENU_ITEMS_MANAGEMENT_GUIDE.md`
4. **API Docs:** Check backend API documentation
5. **Test API:** Use Postman/Swagger to test endpoints

---

## 🎯 Best Practices

### DO ✅
- Add clear descriptions
- Upload high-quality images
- List all allergens
- Set realistic prep times
- Review items before activating
- Keep categories organized
- Regular updates for seasonal items

### DON'T ❌
- Leave required fields empty
- Upload very large images (> 5MB)
- Forget to mark out-of-stock items
- Delete items with active orders
- Use special characters in names
- Skip allergen information
- Forget to set proper prices

---

## 🏁 Checklist for New Item

- [ ] Enter descriptive name
- [ ] Set accurate price
- [ ] Select correct category
- [ ] Add description
- [ ] Upload appealing image
- [ ] List ingredients
- [ ] Mark allergens
- [ ] Set preparation time
- [ ] Add cost (for margin tracking)
- [ ] Set appropriate sort order
- [ ] Check "Active" if ready
- [ ] Check "Available" if in stock
- [ ] Test by viewing in POS

---

**Last Updated:** 2025-01-25  
**Version:** 1.0.0  
**Status:** Production Ready
