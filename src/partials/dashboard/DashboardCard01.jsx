import incomeImg from '../../images/income.svg';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

function DashboardCard01() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/reports');

        let reportData = res.data.data;
        if (reportData.data) {
          reportData = reportData.data;
        }

        if (!Array.isArray(reportData)) {
          throw new Error('Data yang diterima bukan array');
        }

        const today = new Date();
        const daysAgo = (days) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

        const recent30Days = reportData.filter((item) => {
          const createdAt = new Date(item.created_at);
          return createdAt >= daysAgo(30) && createdAt <= today;
        });

        const previous30Days = reportData.filter((item) => {
          const createdAt = new Date(item.created_at);
          return createdAt >= daysAgo(60) && createdAt < daysAgo(30);
        });

        const totalRecent = recent30Days.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
        const totalPrevious = previous30Days.reduce((sum, item) => sum + (parseFloat(item.income) || 0), 0);

        setTotalIncome(totalRecent);

        const percentChange =
          totalPrevious === 0
            ? totalRecent > 0
              ? 100
              : 0
            : ((totalRecent - totalPrevious) / totalPrevious) * 100;

        setPercentage(percentChange.toFixed(1));
      } catch (error) {
        console.error('Gagal ambil data income:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white shadow-xs rounded-xl p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-sherwood-950">Income</h1>
        <div className="inline-flex bg-sherwood-100 p-2 rounded-[12px]">
          <img src={incomeImg} alt="Income" className="w-6 h-6" />
        </div>
      </div>

      {/* Value */}
      <div className="flex justify-center mb-6 mt-3">
        <h3 className="text-3xl font-bold text-sherwood-950">
          + {formatRupiah(totalIncome)}
        </h3>
      </div>

      {/* Percentage */}
      <div className="flex justify-center mt-6">
        <div className="text-base font-semibold text-sherwood-900 bg-sherwood-100 px-12 py-2 rounded-xl">
          {percentage >= 0 ? '+' : ''}
          {percentage} %
        </div>
      </div>
    </div>
  );
}

export default DashboardCard01;
