import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { Pencil, Trash, Plus } from "lucide-react";
import axios from "axios";
import axiosInstance from '../partials/axiosInstance';
import MD from '../images/md.svg';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

const MasterData = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [coaName, setCoaName] = useState("");
    const [coaType, setCoaType] = useState("Debit");
    const [editCoa, setEditCoa] = useState(null);
    const [coaToDelete, setCoaToDelete] = useState(null);


    const today = new Date();
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    let formattedDate = today.toLocaleDateString("en-US", options);

    if (formattedDate.includes(", ")) {
        const parts = formattedDate.split(", ");
        if (parts.length === 3) {
            formattedDate = `${parts[0]}, ${parts[1]} ${parts[2]}`;
        }
    }

    const fetchData = () => {
        setLoading(true);
        axiosInstance.get("/coas")
            .then((response) => {
                setData(response.data.map(coa => ({
                    ...coa,
                    used_in_transactions: coa.transactions && coa.transactions.length > 0
                })));
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError(error.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateCoa = async () => {
        try {
            await axiosInstance.post('/coas', {
                name: coaName,
                base: coaType.toLowerCase(),
            });
            alert("Berhasil! COA dibuat");
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error API:", error.response?.data || error.message);
            alert("Error: " + JSON.stringify(error.response?.data || error.message));
        }
    };

    const handleEditCoa = async () => {
        if (!editCoa) return;
        try {
            await axiosInstance.put(`/coas/${editCoa.id}`, {
                name: coaName,
                base: coaType.toLowerCase(),
            });

            alert("Berhasil! COA diperbarui");
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error API:", error.response?.data || error.message);
            alert("Error: " + JSON.stringify(error.response?.data || error.message));
        }
    };

    const confirmDeleteCoa = (coa) => {
        if (coa.used_in_transactions) {
            alert("COA ini sudah digunakan dalam transaksi dan tidak bisa dihapus.");
            return;
        }
        setCoaToDelete(coa);
        setShowDeleteModal(true);
    };

    const handleDeleteCoa = async () => {
        if (!coaToDelete) return;
        try {
            await axiosInstance.delete(`/coas/${coaToDelete.id}`);
            alert("COA berhasil dihapus");
            setShowDeleteModal(false);
            setCoaToDelete(null);
            fetchData();
        } catch (error) {
            console.error("Error menghapus COA:", error.response?.data || error.message);
            alert("Error: " + JSON.stringify(error.response?.data || error.message));
        }
    };

    const handleOpenEditModal = (coa) => {
        setEditCoa(coa);
        setCoaName(coa.name);
        setCoaType(coa.base.charAt(0).toUpperCase() + coa.base.slice(1));
        setShowModal(true);
    };

    const resetForm = () => {
        setCoaName("");
        setCoaType("Debit");
        setEditCoa(null);
    };

    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                        Master Data
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{formattedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="px-4 py-2 w-full md:w-64 bg-transparent border-0 outline-none focus:outline-none"
                                    style={{ outline: 'none', boxShadow: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowModal(true);
                                    }}
                                    className="bg-[#027A55] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"
                                >
                                    + Add COA
                                </button>
                            </div>
                        </div>

                        <header className="px-5 py-4 border-b flex items-center justify-between border-gray-100 dark:border-gray-700/60">
                            <div className="flex items-center space-x-3">
                                <div className="bg-sherwood-100 p-2 rounded-[12px]">
                                    <img src={MD} className="w-6 h-6" alt="Master Data Icon" />
                                </div>
                                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Master Data</h2>
                            </div>
                        </header>

                        {loading && <p className="text-center text-gray-500">Memuat data...</p>}
                        {error && <p className="text-center text-red-500">{error}</p>}

                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="w-full border rounded-[12px]">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-sm border">No</th>
                                            <th className="p-2 text-sm border">Master COA</th>
                                            <th className="p-2 text-sm border">Tipe</th>
                                            <th className="p-2 text-sm border">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length > 0 ? (
                                            filteredData.map((item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className={`text-center ${index % 2 === 0 ? 'bg-[#d2f7e5]' : 'bg-white hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <td className="p-2 text-sm border">{index + 1}</td>
                                                    <td className="p-2 text-sm border">{item.name}</td>
                                                    <td className="p-2 text-sm border">
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full font-semibold ${item.base === "debit"
                                                                ? "bg-yellow-200 text-yellow-800"
                                                                : "bg-blue-200 text-blue-800"
                                                                }`}
                                                        >
                                                            {item.base.charAt(0).toUpperCase() + item.base.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-sm border flex justify-center gap-2">
                                                        <button
                                                            className="bg-sky-400 hover:bg-sky-500 text-white p-2 rounded-xl transition duration-200"
                                                            onClick={() => handleOpenEditModal(item)}
                                                        >
                                                            <Pencil size={20} />
                                                        </button>
                                                        <button
                                                            className={`bg-red-400 hover:bg-red-500 text-white p-2 rounded-xl transition duration-200 ${item.used_in_transactions ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            disabled={item.used_in_transactions}
                                                            onClick={() => confirmDeleteCoa(item)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center p-4 text-gray-500">
                                                    Tidak ada data ditemukan
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Modal Create / Edit */}
                    {showModal && (
                        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-brightness-75">
                            <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
                                <h3 className="text-lg font-semibold mb-4">
                                    {editCoa ? 'Edit COA' : 'Buat Chart Of Account'}
                                </h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Nama</label>
                                    <input
                                        type="text"
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="Masukkan nama chart of account"
                                        value={coaName}
                                        onChange={(e) => setCoaName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Tipe</label>
                                    <div className="flex items-center gap-6">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="coaType"
                                                value="debit"
                                                checked={coaType === "debit"}
                                                onChange={() => setCoaType("debit")}
                                                className="mr-2"
                                            />
                                            Debit
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="coaType"
                                                value="credit"
                                                checked={coaType === "credit"}
                                                onChange={() => setCoaType("credit")}
                                                className="mr-2"
                                            />
                                            Kredit
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={editCoa ? handleEditCoa : handleCreateCoa}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        {editCoa ? 'Simpan Perubahan' : 'Buat COA'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Delete Confirmation */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-brightness-75">
                            <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
                                <h3 className="text-lg font-semibold mb-4">Hapus COA</h3>
                                <p className="mb-4">Apakah Anda yakin ingin menghapus COA ini?</p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteCoa}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        Hapus COA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MasterData;
