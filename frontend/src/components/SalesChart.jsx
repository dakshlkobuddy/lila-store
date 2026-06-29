import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { money } from "../lib/format.js";

export default function SalesChart({ orders }) {
  const data = useMemo(() => {
    // Generate last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        displayDate: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        revenue: 0,
        orders: 0
      });
    }

    // Aggregate orders
    orders.forEach(o => {
      if (o.status === "Cancelled") return;
      const oDate = o.created_at.split("T")[0];
      const day = days.find(d => d.dateStr === oDate);
      if (day) {
        day.revenue += Number(o.total || 0);
        day.orders += 1;
      }
    });

    return days;
  }, [orders]);

  if (orders.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "12px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "var(--ink)" }}>{label}</p>
          <p style={{ margin: 0, color: "var(--sage)", fontSize: 14 }}>
            Revenue: <span style={{ fontWeight: 700 }}>{money(payload[0].value)}</span>
          </p>
          <p style={{ margin: "4px 0 0 0", color: "var(--accent)", fontSize: 14 }}>
            Orders: <span style={{ fontWeight: 700 }}>{payload[1]?.value || 0}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ec-card" style={{ padding: "24px", marginBottom: "24px" }}>
      <h3 className="ec-disp" style={{ margin: "0 0 20px 0", fontSize: 20 }}>Revenue & Sales (Last 30 Days)</h3>
      <div style={{ height: 300, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--sage)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--sage)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "var(--ink-soft)" }} 
              dy={10}
              minTickGap={30}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
              tickFormatter={(value) => `₹${value}`}
              dx={-10}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={false} // hide right axis text
              width={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--sage)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: "var(--sage)", stroke: "var(--surface)", strokeWidth: 2 }}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="var(--accent)" 
              strokeWidth={2}
              fill="none" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
