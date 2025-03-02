import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchEmployee, addAttendance, fetchFoodMenus } from '../../api';
import { toast } from 'react-toastify';

const EmployeeDetails = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [employeeData, setEmployeeData] = useState(null);
    const [foodMenus, setFoodMenus] = useState([]); // Food menu options
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFoodMenuId, setSelectedFoodMenuId] = useState(null);

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true);
                const res = await fetchEmployee(employeeId);
                setEmployeeData(res.data);
            } catch (error) {
                toast.error('Failed to load employee details.');
                navigate('/employees');
            } finally {
                setLoading(false);
            }
        };

        const getFoodMenus = async () => {
            try {
                const res = await fetchFoodMenus();
                setFoodMenus(res.data);
            } catch (error) {
                toast.error('Failed to load food menus.');
            }
        };

        getEmployeeDetails();
        getFoodMenus();
    }, [employeeId, navigate]);

    const handleGoBack = () => {
        navigate('/employees');
    };

    const handleAttendanceSubmit = async () => {
        if (!selectedFoodMenuId) {
            toast.error('Please select a food menu.');
            return;
        }
        try {
            const response = await addAttendance({
                finger_id: employeeData.employee.finger_id,
                food_menu: selectedFoodMenuId,
            });
            if (response && response.message) {
                toast.success(response.message.detail);
                setIsModalOpen(false);
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message?.detail || 'Failed to record attendance.';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!employeeData) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-4">No Employee Data Found</h2>
                <button onClick={handleGoBack} className="btn-primary px-6 py-2">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col items-center">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
                        Employee Details
                    </h2>
                </div>

                {/* Employee Card */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
                    <div className="mb-4 text-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {employeeData.employee.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Finger ID: {employeeData.employee.finger_id}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="font-medium text-gray-700 dark:text-gray-200">Position:</p>
                            <p className="text-gray-600 dark:text-gray-300">
                                {employeeData.employee.position || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conditionally render Record Attendance Button if user is logged in */}
                {localStorage.getItem('token') && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark transition duration-200"
                        >
                            Record Attendance for {employeeData.employee.name}
                        </button>
                        <div className='px-2'></div>
                        <Link
                            to='/dashboard'
                            className="px-5 py-2 bg-dark text-white rounded-md shadow hover:bg-outline-dark transition duration-200"
                        >
                            Go Back
                        </Link>
                    </div>
                )}
            </div>

            {/* Enhanced Modal for Food Menu Selection */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300 pt-10">
                    <div className="bg-gray dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 px-5">
                        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100 mt-10">
                            Select Food Menu
                        </h3>
                        <div className="space-y-4">
                            {foodMenus.map(menu => (
                                <label
                                    key={menu.id}
                                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                                        selectedFoodMenuId === menu.id
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="foodMenu"
                                        value={menu.id}
                                        checked={selectedFoodMenuId === menu.id}
                                        onChange={() => setSelectedFoodMenuId(menu.id)}
                                        className="mr-3 accent-blue-500"
                                    />
                                    <span className="flex-1 text-gray-800 dark:text-gray-100 font-medium">
                                        {menu.name}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {menu.price} RWF
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-center space-x-4 mb-10">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAttendanceSubmit}
                                className="px-5 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark transition duration-200"
                            >
                                Submit Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDetails;
