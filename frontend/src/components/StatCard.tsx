// components/StatCard.tsx
import React from 'react';

interface StatCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    bgColor?: string; // Hex/rgb/tailwind
}
const StatCard: React.FC<StatCardProps> = ({ title, count, icon, bgColor = "#fff" }) => (
    <div style={{
        background: bgColor,
        borderRadius: 18,
        padding: "26px 20px",
        minWidth: 170,
        boxShadow: "0 2px 8px #f7f7fa",
        border: "1.5px solid #ececec"
    }}>
        <div style={{ fontSize: 19, fontWeight: 500, color: "#36373A", marginBottom: 3 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 28, fontWeight: 600 }}>{count}</span>
            <span>{icon}</span>
        </div>
    </div>
);
export default StatCard;
