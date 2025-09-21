# Pharmacy Stock Management Setup Instructions

## Quick Start

1. **Start the Application:**
   - Double-click `start-everything.bat` in the project root
   - This will start both backend and frontend automatically

2. **Test the API:**
   - Open `test-medicine-api.html` in your browser
   - Try adding medicines and checking pharmacy stock

3. **Login Credentials:**
   - **Pharmacist:** `pharmacy1@teleasha.com` / `password123`
   - **Patient:** `patient1@teleasha.com` / `password123`

## What's New

### For Pharmacists:
- **Add Medicines:** Complete form with stock, price, expiry date
- **Update Stock:** Quick inline stock updates
- **Edit Medicines:** Full medicine information editing
- **Delete Medicines:** Remove medicines from inventory
- **Stock Alerts:** Low stock and out-of-stock notifications
- **Analytics:** Total medicines, low stock count, out of stock count

### For Patients:
- **Search Medicines:** Find medicines across all pharmacies
- **View Availability:** Real-time stock status
- **Pharmacy Info:** Contact details and location
- **Price Comparison:** Compare prices across pharmacies

## API Endpoints

### Medicine Management:
- `POST /api/medicines/add` - Add new medicine
- `PUT /api/medicines/update/{id}` - Update medicine
- `PUT /api/medicines/update-stock/{id}` - Update stock only
- `GET /api/medicines/pharmacy/{pharmacyId}` - Get pharmacy medicines
- `GET /api/medicines/search?q={query}` - Search medicines
- `DELETE /api/medicines/delete/{id}` - Delete medicine

## Database Schema

The `medicines` table now includes:
- `stock` - Current stock quantity
- `min_stock_level` - Minimum stock threshold
- `expiry_date` - Medicine expiry date
- `batch_number` - Batch tracking
- `pharmacy_id` - Associated pharmacy

## Troubleshooting

1. **Backend won't start:**
   - Make sure Java 17+ is installed
   - Install Maven or use IDE to run the project

2. **Frontend shows old data:**
   - Clear browser cache
   - Restart the frontend server

3. **API calls fail:**
   - Check if backend is running on port 8080
   - Verify CORS settings

## Sample Data

The system initializes with:
- 10 sample medicines across 2 pharmacies
- Different stock levels (including low stock and out of stock)
- Various categories (Pain Relief, Antibiotics, etc.)

## Next Steps

1. Start the application using `start-everything.bat`
2. Login as pharmacist to add/manage medicines
3. Login as patient to search and view medicines
4. Test the API using the HTML test page