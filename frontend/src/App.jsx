import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Activity, AlertTriangle, Thermometer, Zap, RefreshCw, Clock } from 'lucide-react'
import './App.css'

function App() {
  const [activeAlerts, setActiveAlerts] = useState([])
  const [dailyCounts, setDailyCounts] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockActiveAlerts = [
    {
      id: 1,
      motorId: 'MTR-01',
      sensorType: 'vibration',
      value: 3.2,
      alertType: 'high_vibration',
      timestamp: '2025-07-28T10:15:00Z',
      processedAt: '2025-07-28T10:15:05Z'
    },
    {
      id: 2,
      motorId: 'MTR-02',
      sensorType: 'temperature',
      value: 85.5,
      alertType: 'high_temperature',
      timestamp: '2025-07-28T10:20:00Z',
      processedAt: '2025-07-28T10:20:03Z'
    },
    {
      id: 3,
      motorId: 'MTR-01',
      sensorType: 'temperature',
      value: 82.3,
      alertType: 'high_temperature',
      timestamp: '2025-07-28T10:25:00Z',
      processedAt: '2025-07-28T10:25:02Z'
    },
    {
      id: 4,
      motorId: 'MTR-03',
      sensorType: 'vibration',
      value: 2.8,
      alertType: 'high_vibration',
      timestamp: '2025-07-28T10:30:00Z',
      processedAt: '2025-07-28T10:30:04Z'
    }
  ]

  const mockDailyCounts = [
    { motor_id: 'MTR-01', alert_date: '2025-07-28', count: 5 },
    { motor_id: 'MTR-02', alert_date: '2025-07-28', count: 3 },
    { motor_id: 'MTR-03', alert_date: '2025-07-28', count: 2 },
    { motor_id: 'MTR-01', alert_date: '2025-07-27', count: 4 },
    { motor_id: 'MTR-02', alert_date: '2025-07-27', count: 6 },
    { motor_id: 'MTR-03', alert_date: '2025-07-27', count: 1 },
    { motor_id: 'MTR-01', alert_date: '2025-07-26', count: 3 },
    { motor_id: 'MTR-02', alert_date: '2025-07-26', count: 2 },
    { motor_id: 'MTR-03', alert_date: '2025-07-26', count: 4 }
  ]

  // Simulate WebSocket connection for motor.notifications
  useEffect(() => {
    // Simulate connection
    setIsConnected(true)
    setActiveAlerts(mockActiveAlerts)
    setDailyCounts(mockDailyCounts)
    setLastUpdate(new Date())

    // Simulate periodic updates
    const interval = setInterval(() => {
      // Randomly add new alerts or update existing ones
      if (Math.random() > 0.7) {
        const newAlert = {
          id: Date.now(),
          motorId: `MTR-0${Math.floor(Math.random() * 3) + 1}`,
          sensorType: Math.random() > 0.5 ? 'vibration' : 'temperature',
          value: Math.random() > 0.5 ? (2.5 + Math.random() * 1.5) : (80 + Math.random() * 15),
          alertType: Math.random() > 0.5 ? 'high_vibration' : 'high_temperature',
          timestamp: new Date().toISOString(),
          processedAt: new Date().toISOString()
        }
        setActiveAlerts(prev => [newAlert, ...prev.slice(0, 9)]) // Keep only 10 most recent
        setLastUpdate(new Date())
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setActiveAlerts(mockActiveAlerts)
    setDailyCounts(mockDailyCounts)
    setLastUpdate(new Date())
    setLoading(false)
  }

  const getSensorIcon = (sensorType) => {
    return sensorType === 'vibration' ? <Zap className="h-4 w-4" /> : <Thermometer className="h-4 w-4" />
  }

  const getAlertBadgeVariant = (alertType) => {
    return alertType.includes('vibration') ? 'destructive' : 'secondary'
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getMotorHealthStatus = (motorId) => {
    const recentAlerts = activeAlerts.filter(alert => 
      alert.motorId === motorId && 
      new Date(alert.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    )
    
    if (recentAlerts.length >= 3) return 'critical'
    if (recentAlerts.length >= 1) return 'warning'
    return 'normal'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  // Prepare chart data
  const chartData = dailyCounts.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.alert_date)
    if (existing) {
      existing[item.motor_id] = item.count
      existing.total += item.count
    } else {
      acc.push({
        date: item.alert_date,
        [item.motor_id]: item.count,
        total: item.count
      })
    }
    return acc
  }, []).sort((a, b) => new Date(b.date) - new Date(a.date))

  const motors = ['MTR-01', 'MTR-02', 'MTR-03']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Factory Motor Health Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring dashboard for assembly line motors</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button onClick={refreshData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeAlerts.filter(a => a.sensorType === 'vibration').length} vibration, {' '}
                {activeAlerts.filter(a => a.sensorType === 'temperature').length} temperature
              </p>
            </CardContent>
          </Card>

          {motors.map(motorId => {
            const status = getMotorHealthStatus(motorId)
            return (
              <Card key={motorId}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{motorId}</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getStatusColor(status)}`}>
                    {status.toUpperCase()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeAlerts.filter(a => a.motorId === motorId).length} active alerts
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Last Update Info */}
        {lastUpdate && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Last updated: {formatTimestamp(lastUpdate)}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Real-time alerts from motor sensors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active alerts</p>
                ) : (
                  activeAlerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSensorIcon(alert.sensorType)}
                        <div>
                          <div className="font-medium">{alert.motorId}</div>
                          <div className="text-sm text-gray-500">
                            {alert.sensorType} = {alert.value}
                            {alert.sensorType === 'vibration' ? 'g' : '°C'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getAlertBadgeVariant(alert.alertType)}>
                          {alert.alertType.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Alert Counts Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Alert Counts</CardTitle>
              <CardDescription>
                Alert frequency by motor over recent days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="MTR-01" fill="#8884d8" name="MTR-01" />
                  <Bar dataKey="MTR-02" fill="#82ca9d" name="MTR-02" />
                  <Bar dataKey="MTR-03" fill="#ffc658" name="MTR-03" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alert Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Trend</CardTitle>
            <CardDescription>
              Total daily alerts across all motors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

