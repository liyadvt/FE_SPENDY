import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { Pencil, Trash2, X } from 'lucide-react';
import axiosInstance from '../partials/axiosInstance';
import TR from '../images/tr.svg';


const Transaction = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [coas, setCoas] = useState([]);
    const [debitCoas, setDebitCoas] = useState([]);
    const [creditCoas, setCreditCoas] = useState([]);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [itemToDeleteNoref, setItemToDeleteNoref] = useState('');

    const [newTransaction, setNewTransaction] = useState({
        date: '',
        type: 'debit',
        coa: '',
        source: '',
        nominal: '',
        note: '',
        noref: '',
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const [transactionRes, coaRes] = await Promise.all([
                axiosInstance.get('/transactions'),
                axiosInstance.get('/coas'),
            ]);

            const coas = coaRes.data;

            const getCoaNameById = (id) => {
                return coas.find(coa => coa.id === id)?.name || '-';
            };

            const result = transactionRes.data.map((t, i) => ({
                no: i + 1,
                id: t.id,
                noref: t.noref,
                type: t.type === 'income' ? 'income' : 'expense',
                date: t.date,
                from: getCoaNameById(t.details[0]?.coa_from),
                to: getCoaNameById(t.details[0]?.coa_to),
                nominal: t.details[0]?.nominal || 0,
                note: t.notes || '-',
                originalType: t.type,
                details: t.details,
            }));

            setCoas(coas);
            setTransactions(result);
            setDebitCoas(coas.filter(coa => coa.base.toLowerCase() === 'debit'));
            setCreditCoas(coas.filter(coa => coa.base.toLowerCase() === 'credit'));
        } catch (error) {
            console.error('Failed to fetch transactions or COAs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoas = async () => {
        try {
            const response = await axiosInstance.get('/coas');
            const data = response.data;
            setCoas(data);
            setDebitCoas(data.filter(coa => coa.base.toLowerCase() === 'debit'));
            setCreditCoas(data.filter(coa => coa.base.toLowerCase() === 'credit'));
        } catch (error) {
            console.error('Failed to fetch COAs:', error);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchCoas();
    }, []);

    const handleEditClick = (transaction) => {
        setSelectedTransaction({
            ...transaction,
            type: transaction.originalType === 'INCOME' ? 'debit' : 'credit',
        });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedTransaction(null);
        setEditModalOpen(false);
    };

    const handleCreateClick = () => {
        setCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setCreateModalOpen(false);
        setNewTransaction({
            date: '',
            type: 'debit',
            coa: '',
            source: '',
            nominal: '',
            note: '',
            noref: '',
        });
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        try {
            const nominal = Number(newTransaction.nominal);
            const isDebit = newTransaction.type.toUpperCase() === 'DEBIT';

            let details = [];

            if (isDebit) { // INCOME
                details.push({
                    coa_from: newTransaction.coa,
                    coa_to: null,
                    debit: nominal,
                    credit: 0,
                });
            } else { // EXPENSE
                details.push({
                    coa_from: newTransaction.source,
                    coa_to: newTransaction.coa,
                    debit: 0,
                    credit: nominal, // Perlu dipastikan apakah benar debit dan credit sama nominal, ini biasa credit saja
                });
            }

            await axiosInstance.post('/transactions', {
                noref: newTransaction.noref || '',
                type: isDebit ? 'INCOME' : 'EXPENSE',
                date: newTransaction.date,
                notes: newTransaction.note,
                details,
            });

            closeCreateModal();
            fetchTransactions();
        } catch (error) {
            console.error('Failed to create transaction:', error);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedTransaction((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        try {
            const payload = {
                noref: selectedTransaction.noref,
                type: selectedTransaction.type.toUpperCase() === 'DEBIT' ? 'INCOME' : 'EXPENSE',
                date: selectedTransaction.date,
                notes: selectedTransaction.note,
                details: [
                    {
                        coa_from: selectedTransaction.type === 'debit' ? selectedTransaction.from : null,
                        coa_to: selectedTransaction.type === 'credit' ? selectedTransaction.to : null,
                        debit: selectedTransaction.type === 'debit' ? Number(selectedTransaction.nominal) : 0,
                        credit: selectedTransaction.type === 'credit' ? Number(selectedTransaction.nominal) : 0,
                    },
                ],
            };

            await axiosInstance.put(`/transactions/${selectedTransaction.id}`, payload);
            closeEditModal();
            fetchTransactions();
        } catch (error) {
            console.error('Failed to update transaction:', error);
        }
    };

    const handleDeleteClick = (id, noref) => {
        setItemToDeleteId(id);
        setItemToDeleteNoref(noref);
        setDeleteConfirmationVisible(true);
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/transactions/${itemToDeleteId}`);
            fetchTransactions();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        } finally {
            setDeleteLoading(false);
            setDeleteConfirmationVisible(false);
            setItemToDeleteId(null);
            setItemToDeleteNoref('');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmationVisible(false);
        setItemToDeleteId(null);
        setItemToDeleteNoref('');
    };

    const openDetailModal = (transaction) => {
        setTransactionDetails(transaction);
        setDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setTransactionDetails(null);
        setDetailModalOpen(false);
    };

    const filteredData = transactions.filter((item) =>
        Object.values(item).some((val) =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const today = new Date();
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    let formattedDate = today.toLocaleDateString("en-US", options);

    if (formattedDate.includes(", ")) {
        const parts = formattedDate.split(", ");
        if (parts.length === 3) {
            formattedDate = `${parts[0]}, ${parts[1]} ${parts[2]}`;
        }
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto bg-white shadow-md rounded-lg">
                        <div className="sm:flex sm:justify-between sm:items-center mb-8">
                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                                        Transaction
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{formattedDate}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="px-4 py-2 w-full md:w-64 bg-transparent border-0 outline-none focus:outline-none"
                                    style={{ outline: 'none', boxShadow: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={handleCreateClick}
                                    className="bg-[#027A55] text-white px-4 py-2 rounded-[12px] hover:bg-green-800 transition font-bold"
                                >
                                    + Add Transaction
                                </button>
                            </div>
                        </div>

                        <header className="px-5 py-4 border-b flex items-center justify-between border-gray-100 dark:border-gray-700/60">
                            <div className="flex items-center space-x-3">
                                <div className="bg-sherwood-100 p-2 rounded-[12px]">
                                    <img src={TR} className="w-6 h-6" alt="Transaction Icon" />
                                </div>
                                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Transaction</h2>
                            </div>
                        </header>


                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg shadow">
                            {loading ? (
                                <p className="p-4 text-center">Loading...</p>
                            ) : (
                                <table className="w-full table-auto border-collapse">
                                    <thead className="bg-gray-100 text-gray-700 text-sm">
                                        <tr>
                                            <th className="p-2 border">No</th>
                                            <th className="p-2 border">Noref</th>
                                            <th className="p-2 border">Type</th>
                                            <th className="p-2 border">Date</th>
                                            <th className="p-2 border">From</th>
                                            <th className="p-2 border">To</th>
                                            <th className="p-2 border">Note</th>
                                            <th className="p-2 border">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length > 0 ? (
                                            filteredData.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={index % 2 === 0 ? 'bg-[#d2f7e5] hover:bg-[#c4f0da]' : 'bg-white hover:bg-gray-100'}
                                                    onClick={() => openDetailModal(item)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="p-2 text-center border text-sm">{item.no}</td>
                                                    <td className="p-2 text-center border text-sm">{item.noref}</td>
                                                    <td className="p-2 text-center border text-sm">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-gray text-xs ${item.type === 'income' ? 'bg-blue-400 text-black' : 'bg-yellow-400 text-black'
                                                                }`}
                                                        >
                                                            {item.type === 'income' ? 'Income' : 'Expense'}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-center border text-sm">
                                                        {new Date(item.date).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="p-2 text-center border text-sm">{item.from}</td>
                                                    <td className="p-2 text-center border text-sm">{item.to}</td>
                                                    <td className="p-2 text-center border text-sm">{item.note}</td>
                                                    <td className="p-2 text-center border">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(item);
                                                                }}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(item.id, item.noref);
                                                                }}
                                                                disabled={deleteLoading}
                                                                className={`p-1 rounded text-white ${deleteLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                                                                    }`}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center p-4 text-gray-500">
                                                    Data tidak ditemukan
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75">
                    <div className="bg-white rounded-lg w-[400px] p-6 shadow-xl relative">
                        <button onClick={closeCreateModal} className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg font-bold">×</button>
                        <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Create Transaction</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={newTransaction.date}
                                    onChange={handleCreateChange}
                                    className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Noref</label>
                                <input
                                    type="text"
                                    name="noref"
                                    value={newTransaction.noref}
                                    onChange={handleCreateChange}
                                    placeholder="Input your noref in here ..."
                                    className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Type</label>
                                <div className="flex gap-4 items-center">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="debit"
                                            checked={newTransaction.type === 'debit'}
                                            onChange={handleCreateChange}
                                        />
                                        Debit (Income)
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="credit"
                                            checked={newTransaction.type === 'credit'}
                                            onChange={handleCreateChange}
                                        />
                                        Credit (Expense)
                                    </label>
                                </div>
                            </div>

                            {/* Dinamis berdasarkan type */}
                            {newTransaction.type === 'debit' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">COA</label>
                                        <select
                                            name="coa"
                                            value={newTransaction.coa}
                                            onChange={handleCreateChange}
                                            className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select COA</option>
                                            {debitCoas.map((coa) => (
                                                <option key={coa.id} value={coa.id}>
                                                    {coa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Nominal</label>
                                        <input
                                            type="number"
                                            name="nominal"
                                            value={newTransaction.nominal}
                                            onChange={handleCreateChange}
                                            placeholder="Rp"
                                            className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {newTransaction.type === 'credit' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">COA</label>
                                        <select name="coa"
                                            value={newTransaction.coa}
                                            onChange={handleCreateChange}
                                            className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select COA</option>
                                            {debitCoas.map((coa) => (
                                                <option key={coa.id} value={coa.id}>
                                                    {coa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Source</label>
                                        <select
                                            name="source"
                                            value={newTransaction.source}
                                            onChange={handleCreateChange}
                                            className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select Source</option>
                                            {creditCoas.map((coa) => (
                                                <option key={coa.id} value={coa.id}>
                                                    {coa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Nominal</label>
                                        <input
                                            type="number"
                                            name="nominal"
                                            value={newTransaction.nominal}
                                            onChange={handleCreateChange}
                                            placeholder="Rp"
                                            className="w-full border border-green-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-1">Note</label>
                                <textarea
                                    name="note"
                                    value={newTransaction.note}
                                    onChange={handleCreateChange}
                                    placeholder="Input your note in here ..."
                                    className="w-full border border-green-600 rounded-[12px] px-3 py-2 h-24 resize-none focus:outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="px-4 py-2 border border-green-600 text-green-600 rounded-[12px] hover:bg-green-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-700 text-white rounded-[12px] hover:bg-green-800"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75">
                    <div className="bg-white rounded-lg w-[400px] p-6 shadow-xl relative">
                        <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg font-bold">×</button>
                        <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Edit Transaction</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={selectedTransaction.date}
                                    onChange={handleInputChange}
                                    className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Noref</label>
                                <input
                                    type="text"
                                    name="noref"
                                    value={selectedTransaction.noref}
                                    onChange={handleInputChange}
                                    className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                    readOnly
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Type</label>
                                <div className="flex gap-4 items-center">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="debit"
                                            checked={selectedTransaction.type === 'debit'}
                                            onChange={handleInputChange}
                                        />
                                        Debit (Income)
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="credit"
                                            checked={selectedTransaction.type === 'credit'}
                                            onChange={handleInputChange}
                                        />
                                        Credit (Expense)
                                    </label>
                                </div>
                            </div>

                            {/* Dinamis berdasarkan type untuk Edit */}
                            {selectedTransaction.type === 'debit' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">COA</label>
                                        <select
                                            name="from"
                                            value={selectedTransaction.from}
                                            onChange={handleInputChange}
                                            className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select COA</option>
                                            {debitCoas.map((coa) => (
                                                <option key={coa.id} value={coa.id}>
                                                    {coa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Nominal</label>
                                        <input
                                            type="number"
                                            name="nominal"
                                            value={selectedTransaction.nominal}
                                            onChange={handleInputChange}
                                            placeholder="Rp"
                                            className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {selectedTransaction.type === 'credit' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">COA</label>
                                        <select
                                            name="from"
                                            value={selectedTransaction.from}
                                            onChange={handleInputChange}
                                            className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select COA</option>
                                            {debitCoas.map((coa) => (
                                                <option key={coa.id} value={coa.id}>
                                                    {coa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Source</label>
                                        <select
                                            name="to"
                                            value={selectedTransaction.to}
                                            onChange={handleInputChange}
                                            className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select Source</option>
                                            {creditCoas.map((coa) => (
                                                <option key={coa.id} value={coa.id}>
                                                    {coa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Nominal</label>
                                        <input
                                            type="number"
                                            name="nominal"
                                            value={selectedTransaction.nominal}
                                            onChange={handleInputChange}
                                            placeholder="Rp"
                                            className="w-full border border-blue-600 rounded-[12px] px-3 py-2 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-1">Note</label>
                                <textarea
                                    name="note"
                                    value={selectedTransaction.note}
                                    onChange={handleInputChange}
                                    placeholder="Input your note in here ..."
                                    className="w-full border border-blue-600 rounded-[12px] px-3 py-2 h-24 resize-none focus:outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 border border-gray-400 text-gray-600 rounded-[12px] hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-[12px] hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detailModalOpen && transactionDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75">
                    <div className="bg-white rounded-lg w-[500px] p-6 shadow-xl relative">

                        {/* Close Button */}
                        <button
                            onClick={closeDetailModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg font-bold"
                        >
                            ×
                        </button>

                        {/* Header */}
                        <h2 className="text-lg font-bold text-center text-gray-800 mb-4">
                            Detail Transaction {transactionDetails.type === 'income' ? 'Income' : 'Expense'}
                        </h2>

                        {/* Transaction Info */}
                        <div className="text-sm text-gray-700 space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="font-semibold">Noref</span>
                                <span>{transactionDetails.noref}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Date</span>
                                <span>{new Date(transactionDetails.date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between capitalize">
                                <span className="font-semibold">Type</span>
                                <span>{transactionDetails.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Note</span>
                                <span className="text-right w-2/3">{transactionDetails.note}</span>
                            </div>
                        </div>

                        {/* Table Header */}
                        <table className="w-full border-t border-b text-sm text-gray-700 mb-4">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="py-2 px-3 font-semibold">COA Name</th>
                                    <th className="py-2 px-3 font-semibold text-right">Debit</th>
                                    <th className="py-2 px-3 font-semibold text-right">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionDetails.details?.map((detail, index) => (
                                    <React.Fragment key={index}>
                                        {/* Debit row */}
                                        <tr className="border-t">
                                            <td className="py-2 px-3">{transactionDetails.from || detail.coa_name || '-'}</td>
                                            <td className="py-2 px-3 text-right">
                                                {detail.debit ? `Rp ${Number(detail.debit).toLocaleString()}` : '-'}
                                            </td>
                                            <td className="py-2 px-3 text-right">-</td>
                                        </tr>
                                        {/* Credit row */}
                                        <tr className="border-t">
                                            <td className="py-2 px-3">{transactionDetails.to || detail.coa_name || '-'}</td>
                                            <td className="py-2 px-3 text-right">-</td>
                                            <td className="py-2 px-3 text-right">
                                                {detail.credit ? `Rp ${Number(detail.credit).toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={closeDetailModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[12px] hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmationVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <div className="flex justify-center items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-200 text-red-600 flex items-center justify-center">
                                <Trash2 size={24} />
                            </div>
                        </div>
                        <h2 className="text-lg font-semibold text-center text-gray-800 mb-2">Delete Transaction</h2>
                        <p className="text-center text-gray-600 mb-4">
                            Are you sure want to delete this <span className="font-semibold">{itemToDeleteNoref}</span> ?
                            <br />
                            This action cannot be undone !
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-400 text-gray-600 rounded-[12px] hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                                className={`px-4 py-2 rounded-[12px] text-white focus:outline-none ${deleteLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transaction;