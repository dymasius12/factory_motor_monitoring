# Factory Motor Health Monitoring Dashboard

A React-based dashboard for monitoring factory motor health alerts in real-time. This frontend application displays active alerts, motor status, and historical alert data with interactive charts.

## Features

- **Real-time Alert Monitoring**: Displays active alerts from motor sensors
- **Motor Status Overview**: Shows health status for each motor (MTR-01, MTR-02, MTR-03)
- **Interactive Charts**: Bar charts for daily alert counts and line charts for alert trends
- **WebSocket Integration**: Simulated real-time updates (ready for actual WebSocket connection)
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Technology Stack

- **React 18**: Frontend framework
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## Development

```bash
# Start development server with host binding
pnpm run dev --host
```

The application will be available at `http://localhost:5173`

## Dashboard Components

### Status Cards
- **Active Alerts**: Total count of current alerts
- **Motor Status**: Individual status for each motor (NORMAL, WARNING, CRITICAL)

### Active Alerts Table
- Real-time list of alerts with sensor type, value, and timestamp
- Color-coded badges for different alert types
- Icons for vibration and temperature sensors

### Charts
- **Daily Alert Counts**: Bar chart showing alert frequency by motor over recent days
- **Alert Trend**: Line chart showing total daily alerts across all motors

## Data Integration

The dashboard is designed to integrate with:

1. **WebSocket Connection**: For real-time `motor.notifications` messages
2. **REST API**: For historical data queries
3. **Mock Data**: Currently uses simulated data for demonstration

### Expected Data Formats

**Alert Notification (WebSocket):**
```json
{
  "alertId": 123,
  "motorId": "MTR-01",
  "sensorType": "vibration",
  "timestamp": "2025-07-17T10:15:00Z",
  "value": 3.2,
  "alertType": "high_vibration",
  "processedAt": "2025-07-17T10:15:05Z"
}
```

**Daily Counts (REST API):**
```json
[
  {
    "motor_id": "MTR-01",
    "alert_date": "2025-07-28",
    "count": 5
  }
]
```

## Customization

### Adding New Motors
Update the `motors` array in `App.jsx`:
```javascript
const motors = ['MTR-01', 'MTR-02', 'MTR-03', 'MTR-04']
```

### Modifying Alert Thresholds
Update the status calculation logic in the `getMotorHealthStatus` function.

### Styling
- Modify `src/App.css` for custom styles
- Use Tailwind classes for responsive design
- Customize shadcn/ui components as needed

## Production Deployment

1. Build the application:
   ```bash
   pnpm run build
   ```

2. Deploy the `dist` folder to your web server

3. Configure environment variables for API endpoints

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading for chart components
- Efficient re-rendering with React hooks
- Optimized bundle size with Vite
- Responsive images and icons

