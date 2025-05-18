import React, { useEffect, useState } from 'react';
import balanceImg from '../../images/balance.svg'; // konsisten nama
import axiosInstance from '../axiosInstance';

function DashboardCard03() {
  const [balance, setBalance] = useState(0);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/reports');
        const data = res.data;

        let reportData = data.data;
        if (reportData.data) {
          reportData = reportData.data;
        }

        if (!Array.isArray(reportData)) {
          throw new Error('Data balance bukan array');
        }

        const sortedData = [...reportData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const latestTransaction = sortedData[0];

        if (latestTransaction) {
          setBalance(parseFloat(latestTransaction.balance) || 0);
        }
      } catch (error) {
        console.error('Gagal ambil data balance:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white shadow-xs rounded-xl p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-sherwood-950">Balance</h1>
        <div className="inline-flex bg-sherwood-100 p-2 rounded-[12px]">
          <img src={balanceImg} alt="Balance" className="w-6 h-6" />
        </div>
      </div>

      {/* Value */}
      <div className="flex justify-center mb-6 mt-3">
        <h3 className="text-3xl font-bold text-sherwood-950">
          {formatRupiah(balance)}
        </h3>
      </div>
    </div>
  );
}

export default DashboardCard03;
