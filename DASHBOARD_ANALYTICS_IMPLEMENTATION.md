# Dashboard Analytics API Implementation

This document describes the implementation of the Dashboard Analytics API integration for the admin dashboard.

## Overview

The Dashboard Analytics API provides comprehensive metrics and statistics for the admin dashboard, including user statistics, media counts, revenue data, and subscription information. This implementation includes:

- Custom React hook for data fetching
- Reusable analytics component
- Integration with existing admin dashboard
- Comprehensive error handling
- Responsive design

## Files Created/Modified

### New Files

1. **`src/hooks/useAnalytics.js`**
   - Custom React hook for fetching analytics data
   - Handles loading states, error handling, and data management
   - Provides refresh functionality

2. **`src/Components/pages/admin/components/AnalyticsOverview.jsx`**
   - Main analytics display component
   - Shows all metrics in a responsive grid layout
   - Includes breakdown sections for detailed statistics

3. **`src/Components/pages/admin/components/AnalyticsOverview.css`**
   - Comprehensive styling for the analytics component
   - Responsive design for mobile and desktop
   - Modern card-based layout with hover effects

4. **`src/Components/examples/AnalyticsExample.jsx`**
   - Example component showing direct API usage
   - Demonstrates error handling patterns
   - Useful for testing and development

### Modified Files

1. **`src/Components/pages/admin/AdminDashboard.jsx`**
   - Integrated AnalyticsOverview component
   - Removed hardcoded stats
   - Added import for AnalyticsOverview

## API Integration Details

### Authentication
- Uses JWT token from localStorage
- Automatically includes Authorization header via axios interceptor
- Handles token refresh and authentication errors

### Error Handling
- **401 Unauthorized**: Redirects to login page
- **403 Forbidden**: Shows permission denied message
- **500 Internal Server Error**: Shows server error message
- **Network errors**: Shows connection error message

### Data Format
The API returns data in the following structure:
```json
{
  "total_users": 1250,
  "users_this_week": 23,
  "total_media_items": 5420,
  "active_users": 89,
  "pending_approvals": 12,
  "total_revenue": 12500.50,
  "revenue_this_month": 3200.75,
  "breakdown": {
    "talent_users": 800,
    "background_users": 450,
    "verified_users": 650,
    "premium_subscribers": 180
  },
  "media_breakdown": {
    "talent_media": 4200,
    "band_media": 1220
  },
  "subscription_stats": {
    "active_subscriptions": 180,
    "trial_subscriptions": 25,
    "cancelled_this_month": 8
  }
}
```

## Usage Examples

### Using the Custom Hook
```javascript
import useAnalytics from '../hooks/useAnalytics';

const MyComponent = () => {
  const { analytics, loading, error, refreshAnalytics } = useAnalytics();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>No data</div>;

  return (
    <div>
      <h2>Total Users: {analytics.total_users}</h2>
      <button onClick={refreshAnalytics}>Refresh</button>
    </div>
  );
};
```

### Direct API Usage
```javascript
import axiosInstance from '../api/axios';

const fetchAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/analytics/');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};
```

### Using the AnalyticsOverview Component
```javascript
import AnalyticsOverview from './components/AnalyticsOverview';

const Dashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AnalyticsOverview />
    </div>
  );
};
```

## Features

### Analytics Cards
- **Total Users**: Shows total user count with weekly growth
- **Total Media Items**: Displays total content uploaded
- **Active Users**: Shows users active in last 24 hours
- **Pending Approvals**: Items requiring admin attention
- **Total Revenue**: Complete revenue with monthly breakdown
- **Monthly Revenue**: Revenue for the last 30 days

### Breakdown Sections
- **User Breakdown**: Talent users, background users, verified users, premium subscribers
- **Media Breakdown**: Talent media vs band media counts
- **Subscription Stats**: Active, trial, and cancelled subscriptions

### Interactive Features
- **Refresh Button**: Manual data refresh capability
- **Hover Effects**: Enhanced user experience
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error messages

## Styling

The analytics component uses a modern, card-based design with:
- Gradient backgrounds for icons
- Hover animations
- Responsive grid layouts
- Consistent color scheme
- Mobile-first approach

## Security Considerations

- Only users with `is_dashboard_admin=True` can access the API
- JWT token validation on every request
- Automatic token refresh handling
- Secure error messages (no sensitive data exposure)

## Performance

- Single API call loads all analytics data
- Efficient React state management
- Minimal re-renders
- Responsive design for fast loading

## Testing

To test the implementation:

1. **Login as admin user** with dashboard permissions
2. **Navigate to admin dashboard** overview tab
3. **Verify analytics data** is displayed correctly
4. **Test refresh functionality** by clicking the refresh button
5. **Test error handling** by temporarily breaking the API endpoint

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Ensure user is logged in with valid JWT token
   - Check if token has expired

2. **"Permission denied" error**
   - Verify user has `is_dashboard_admin=True`
   - Check user permissions in admin panel

3. **"Network error"**
   - Check API endpoint URL
   - Verify network connectivity
   - Check CORS settings

4. **Data not loading**
   - Check browser console for errors
   - Verify API endpoint is working
   - Check authentication status

### Debug Mode

Enable debug logging by checking browser console for:
- Request/response logs from axios interceptor
- Analytics hook state changes
- Component render logs

## Future Enhancements

Potential improvements for future versions:

1. **Caching**: Implement client-side caching for better performance
2. **Real-time Updates**: WebSocket integration for live data
3. **Export Functionality**: PDF/CSV export of analytics data
4. **Custom Date Ranges**: Allow users to select custom time periods
5. **Charts and Graphs**: Visual representation of data trends
6. **Drill-down Capability**: Click on metrics to see detailed breakdowns

## API Documentation

For complete API documentation, refer to the original API documentation provided. The implementation follows all specified endpoints, authentication requirements, and response formats.

## Support

For issues or questions regarding this implementation:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify API endpoint accessibility
4. Check user permissions and authentication status
