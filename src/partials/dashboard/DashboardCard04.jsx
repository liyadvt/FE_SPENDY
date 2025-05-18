import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Report from '../../images/report.svg';
import axiosInstance from '../axiosInstance';

function DashboardCard04() {
    const [report, setReport] = useState([]);
    const location = useLocation();

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axiosInstance.get('/reports');
                const data = res.data;

                let reportData = data.data;
                if (reportData.data) {
                    reportData = reportData.data;
                }

                setReport(reportData || []);
            } catch (err) {
                console.error('Error fetching reports:', err);
            }
        };

        fetchReports();
    }, []);


    // Kalau di dashboard, ambil 5 terakhir
    const displayedReports = location.pathname === '/'
        ? [...report].slice(-5).reverse()
        : report;

    return (
        <div className="col-span-full xl:col-span-12 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <header className="px-5 py-4 border-b flex items-center justify-between border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center space-x-3">
                    <div className="bg-sherwood-100 p-2 rounded-[12px]">
                        <img src={Report} className="w-6 h-6" alt="Report Icon" />
                    </div>
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">Report</h2>
                </div>
            </header>

            <div className="p-3">
                <div className="overflow-x-auto">
                    <div className="table-responsive mb-6">
                        <table className="border-collapse border min-w-full table-auto text-left mb-4">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">No</th>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">Note</th>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">Date</th>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">COA Name</th>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">Debit</th>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">Credit</th>
                                    <th className="px-4 py-2 border-b border bg-sherwood-50">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedReports.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            index % 2 === 0
                                                ? "bg-[#d2f7e5]"
                                                : "bg-white hover:bg-gray-100"
                                        }
                                    >
                                        <td className="px-4 py-2 border-b border">{index + 1}</td>
                                        <td className="px-4 py-2 border-b border">{item.note}</td>
                                        <td className="px-4 py-2 border-b border">{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 border-b border">{item.coa_name}</td>
                                        <td className="px-4 py-2 border-b border">{formatRupiah(item.debit)}</td>
                                        <td className="px-4 py-2 border-b border">{formatRupiah(item.credit)}</td>
                                        <td className="px-4 py-2 border-b border">{formatRupiah(item.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {location.pathname === '/' && (
                            <div className="text-right">
                                <Link
                                    to="/report"
                                    className="inline-block hover:text-sherwood-800 text-gray-400 font-small py-2 px-4 rounded-lg transition duration-150"
                                >
                                    <p>See More <i className="fa-solid fa-chevron-right"></i></p>
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardCard04;
