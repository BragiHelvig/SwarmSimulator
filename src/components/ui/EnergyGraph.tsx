import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useSimulation } from '@/store/useSimulationStore'

export function EnergyGraph() {
  const { state } = useSimulation()
  const { energyHistory } = state

  const data = energyHistory.map((d) => ({
    time: d.time.toFixed(1),
    power: d.power / 1000,
  }))

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed bottom-4 left-4 w-[min(400px,45vw)] z-10 pointer-events-none"
    >
      <div className="backdrop-blur-xl bg-black/40 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 p-4 font-mono pointer-events-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-amber" />
          <span className="text-slate-400 text-xs uppercase tracking-wider">Energy Accumulation</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffb347" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ffb347" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(v) => `${v.toFixed(1)} GW`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                }}
                formatter={(value: number) => [`${value.toFixed(2)} GW`, 'Power']}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="#ffb347"
                strokeWidth={1.5}
                fill="url(#powerGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
