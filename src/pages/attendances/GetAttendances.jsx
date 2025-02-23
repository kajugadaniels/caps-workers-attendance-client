import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Eye,
    Search
} from 'lucide-react'
import { fetchAttendances } from '../../api'
import { useNavigate } from 'react-router-dom'

const GetAttendances = () => {
    const navigate = useNavigate()
    const [attendanceData, setAttendanceData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Filters & search
    const [searchTerm, setSearchTerm] = useState('')
    const [attendanceFilter, setAttendanceFilter] = useState('')
    const [genderFilter, setGenderFilter] = useState('')
    const [positionFilter, setPositionFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // 7-day window (2 past days, today, 4 future days)
    const dayOffsets = [-2, -1, 0, 1, 2, 3, 4]
    const daysArray = dayOffsets.map((offset) => {
        const d = new Date()
        d.setDate(d.getDate() + offset)
        return d
    })

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true)
                const res = await fetchAttendances()
                if (res.data) {
                    // Each record typically has: 
                    // { employee_id, name, phone, position, attendance_status, date, ... }
                    setAttendanceData(res.data)
                }
            } catch (err) {
                setError('Failed to fetch attendance.')
                toast.error(
                    err.response?.data?.message?.detail ||
                    err.response?.data?.detail ||
                    'Error fetching attendance records.'
                )
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [])

    // --------------------------------------
    //  Filtering & Search
    // --------------------------------------
    const filteredData = attendanceData.filter((emp) => {
        // 1) Search by name or phone
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone.toLowerCase().includes(searchTerm.toLowerCase())

        // 2) Filter by attendance status (Present/Absent) for today's status
        const matchesAttendance = attendanceFilter
            ? emp.attendance_status === attendanceFilter
            : true

        // 3) Gender filter
        let matchesGender = true
        if (genderFilter && emp.gender) {
            matchesGender = emp.gender === genderFilter
        } else if (genderFilter && !emp.gender) {
            matchesGender = false
        }

        // 4) Position filter
        const matchesPosition = positionFilter
            ? (emp.position || '').toLowerCase() === positionFilter.toLowerCase()
            : true

        // 5) Date range filter – assume each record has a `date` field (ISO string)
        let matchesDateRange = true
        if (startDate) {
            const empDate = new Date(emp.date)
            const start = new Date(startDate)
            if (empDate < start) matchesDateRange = false
        }
        if (endDate) {
            const empDate = new Date(emp.date)
            const end = new Date(endDate)
            if (empDate > end) matchesDateRange = false
        }

        return (
            matchesSearch &&
            matchesAttendance &&
            matchesGender &&
            matchesPosition &&
            matchesDateRange
        )
    })

    // --------------------------------------
    //  Pagination
    // --------------------------------------
    const totalRecords = filteredData.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleShowEmployee = (employee_id) => {
        navigate(`/employee/${employee_id}`)
    }

    // --------------------------------------
    //  Helper: Format Date
    // --------------------------------------
    const formatDate = (dateObj) => {
        return dateObj.toISOString().split('T')[0] // "YYYY-MM-DD"
    }

    // --------------------------------------
    //  For each day in [past2..today..future4], figure out an Attendance display
    // --------------------------------------
    const getDayStatus = (employee, dayIndex) => {
        const thatDay = daysArray[dayIndex]
        const today = new Date()
        const isPastOrToday = thatDay <= today

        if (!isPastOrToday) {
            return 'Future'
        }

        const offset = dayOffsets[dayIndex]
        if (offset === 0) {
            return employee.attendance_status || 'Absent'
        } else if (offset < 0) {
            return 'No Data'
        }
        return 'N/A'
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Employee Attendance (Last 2 days, Today, Next 4 days)
                </h2>
            </div>

            <div className="mt-5 grid grid-cols-12 gap-6">
                {/* SEARCH & FILTERS */}
                <div className="intro-y col-span-12 mt-2 flex flex-wrap items-center gap-2 xl:flex-nowrap">
                    {/* Search by name or phone */}
                    <div className="relative w-56 text-slate-500">
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 !box w-56 pr-10"
                        />
                        <Search className="stroke-1.5 absolute inset-y-0 right-0 my-auto mr-3 h-4 w-4" />
                    </div>

                    {/* Attendance Status Filter */}
                    <select
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                        value={attendanceFilter}
                        onChange={(e) => {
                            setAttendanceFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>

                    {/* Gender Filter */}
                    <select
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                        value={genderFilter}
                        onChange={(e) => {
                            setGenderFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>

                    {/* Position Filter */}
                    <select
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                        value={positionFilter}
                        onChange={(e) => {
                            setPositionFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Positions</option>
                        <option value="Construction">Construction</option>
                    </select>

                    {/* Date Range Filters */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-40 disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700"
                        />
                        <span className="text-sm text-slate-700">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-40 disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700"
                        />
                    </div>
                </div>

                <div className="intro-y col-span-12 overflow-auto 2xl:overflow-visible">
                    {loading ? (
                        <div className="text-center py-10">Loading attendance...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-medium">No Attendance Found</h3>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                                Looks like no employees match your criteria.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left -mt-2 border-separate border-spacing-y-[10px]">
                            <thead>
                                <tr>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        <input
                                            type="checkbox"
                                            className="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        Name
                                    </th>
                                    {/* Create a column for each day in the 7-day window */}
                                    {daysArray.map((d, idx) => (
                                        <th
                                            key={idx}
                                            className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center"
                                        >
                                            {formatDate(d)}
                                        </th>
                                    ))}
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((emp, idx) => (
                                    <tr key={idx} className="intro-x">
                                        <td className="px-5 py-3 border-b dark:border-300 box w-10 whitespace-nowrap border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <input
                                                type="checkbox"
                                                className="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 !py-3.5 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center">
                                                <div className="image-fit zoom-in h-9 w-9">
                                                    {/* Placeholder image */}
                                                    <img
                                                        src="https://midone-html.left4code.com/dist/images/fakers/preview-6.jpg"
                                                        className="tooltip cursor-pointer rounded-lg border-white shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)]"
                                                        alt="employee avatar"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <span className="whitespace-nowrap font-medium">
                                                        {emp.name}
                                                    </span>
                                                    <div className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                                                        ID: {emp.employee_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* For each of the 7 days, show a status cell */}
                                        {daysArray.map((d, dayIdx) => {
                                            const status = getDayStatus(emp, dayIdx) // "Present", "Absent", "No Data", "Future"
                                            let bgColor = 'bg-slate-400'
                                            if (status === 'Present') bgColor = 'bg-success'
                                            else if (status === 'Absent' || status === 'No Data') bgColor = 'bg-danger'
                                            else if (status === 'Future') bgColor = 'bg-warning'

                                            return (
                                                <td
                                                    key={dayIdx}
                                                    className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600"
                                                >
                                                    <span
                                                        className={`px-3 py-1 inline-block rounded-full text-xs text-white ${bgColor}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                            )
                                        })}
                                        <td className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    className="mr-3 flex items-center text-blue-600"
                                                    onClick={() => handleShowEmployee(emp.employee_id)}
                                                >
                                                    <Eye className="stroke-1.5 mr-1 h-4 w-4" />
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination area */}
                {filteredData.length > 0 && (
                    <div className="intro-y col-span-12 flex flex-wrap items-center sm:flex-row sm:flex-nowrap mt-4">
                        <nav className="w-full sm:mr-auto sm:w-auto">
                            <ul className="flex w-full mr-0 sm:mr-auto sm:w-auto gap-2">
                                <li>
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        First
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        <ChevronLeft className="stroke-1.5 h-4 w-4" />
                                    </button>
                                </li>

                                {/* Page indicator */}
                                <li>
                                    <span className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </li>

                                <li>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        <ChevronRight className="stroke-1.5 h-4 w-4" />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        <ChevronsRight className="stroke-1.5 h-4 w-4" />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </>
    )
}

export default GetAttendances
