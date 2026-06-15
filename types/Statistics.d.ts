export interface YearlyChartItem {
  month: string;
  income: number;
  expense: number;
  balance: number;
  runningBalance: number;
}

export interface StatisticsData {
  athletes: number;
  coaches: number;
  schools: number;
  media: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  yearlyChart: YearlyChartItem[];
}