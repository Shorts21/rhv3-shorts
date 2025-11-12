import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface DataPoint {
  month: string
  value: number
}

interface RHIndicatorCardProps {
  title: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  tooltip: string
  data: DataPoint[]
  unit?: string
}

export function RHIndicatorCard({ title, value, trend, tooltip, data, unit = '' }: RHIndicatorCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const trendConfig = {
    up: { color: 'text-green-600', icon: TrendingUp, bgColor: 'bg-green-100' },
    down: { color: 'text-red-600', icon: TrendingDown, bgColor: 'bg-red-100' },
    neutral: { color: 'text-gray-600', icon: TrendingUp, bgColor: 'bg-gray-100' }
  }

  const config = trendConfig[trend]
  const TrendIcon = config.icon

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
          {showTooltip && (
            <div className="absolute z-50 right-0 top-8 w-72 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl animate-in fade-in duration-200">
              <div className="whitespace-pre-line">{tooltip}</div>
              <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-4xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-2xl text-gray-600 ml-1">{unit}</span>}
        </span>
        <div className={`${config.bgColor} p-3 rounded-xl`}>
          <TrendIcon className={`w-6 h-6 ${config.color}`} />
        </div>
      </div>

      <div className="h-32 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}${unit}`, title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: '#22c55e', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
