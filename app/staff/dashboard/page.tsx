"use client";

import React from "react";
import {
  Wallet,
  Users,
  GraduationCap,
  School,
  FileBarChart,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useStatistics } from "@/hooks/useStatistics";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: p.color }}>
            {p.name}: {formatIDR(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: statistics, isLoading } = useStatistics();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border bg-card p-5">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  //@ts-ignore
  const data = statistics?.data;
  const yearlyData = data?.yearlyChart || [];

  const stats = [
    {
      title: "Total Atlet",
      value: data?.athletes || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Pelatih",
      value: data?.coaches || 0,
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Sekolah",
      value: data?.schools || 0,
      icon: School,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Total Media",
      value: data?.media || 0,
      icon: FileBarChart,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Pengurus</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan data Trisula Sport Club
        </p>
      </div>

      {/* Statistic Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <h3 className="mt-2 text-2xl font-bold">{item.value}</h3>
              </div>
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.bg}`}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Finance Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Total Pemasukan</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatIDR(data?.totalIncome || 0)}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold">Total Pengeluaran</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatIDR(data?.totalExpense || 0)}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileBarChart className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold">Saldo Bersih</h3>
          </div>
          <p className="text-2xl font-bold text-violet-600">
            {formatIDR(data?.currentBalance || 0)}
          </p>
        </div>
      </div>

      {/* Line Chart for Yearly Data */}
      {yearlyData.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Grafik Keuangan Tahunan
            </h3>
            <p className="text-sm text-muted-foreground">
              Perkembangan pemasukan, pengeluaran, dan total saldo per bulan
            </p>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={yearlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => formatIDR(value)}
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="runningBalance"
                name="Total Saldo"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#8b5cf6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Summary Table for Yearly Data */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">Bulan</th>
                  <th className="text-right py-2 px-3 font-semibold">Pemasukan</th>
                  <th className="text-right py-2 px-3 font-semibold">Pengeluaran</th>
                  <th className="text-right py-2 px-3 font-semibold">Saldo Bulanan</th>
                  <th className="text-right py-2 px-3 font-semibold">Total Saldo</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((item: any, index: number) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{item.month}</td>
                    <td className="text-right py-2 px-3 text-emerald-600">
                      {formatIDR(item.income)}
                    </td>
                    <td className="text-right py-2 px-3 text-red-600">
                      {formatIDR(item.expense)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {formatIDR(item.balance)}
                    </td>
                    <td className="text-right py-2 px-3 text-violet-600 font-medium">
                      {formatIDR(item.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}