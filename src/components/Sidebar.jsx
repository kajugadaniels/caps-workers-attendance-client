import React from 'react'
import { CookingPot, House, Speaker, UsersRound } from 'lucide-react'
import { useLocation, NavLink } from 'react-router-dom'
import Logo from '../assets/img/logo-icon.png'

const Sidebar = () => {
    const { pathname } = useLocation()

    // Check active state for each sidebar item.
    const isDashboardActive = pathname === '/dashboard'
    const isFoodMenuActive = pathname.startsWith('/food-menus') || pathname.startsWith('/food-menu')
    const isEmployeesActive = pathname.startsWith('/employees') || pathname.startsWith('/employee')
    const isAttendanceActive = pathname === '/attendance'

    return (
        <nav className="side-nav hidden w-[80px] overflow-x-hidden pb-16 pr-5 md:block xl:w-[230px]">
            <NavLink className="flex items-center pt-4 pl-5 intro-x" to="/dashboard">
                <img
                    className="w-6"
                    src={Logo}
                    alt="Logo"
                />
                <span className="hidden ml-3 text-lg text-white xl:block fs-16">FASTFAST</span>
            </NavLink>
            <div className="my-6 side-nav__divider"></div>
            <ul>
                <li>
                    <NavLink
                        to="/dashboard"
                        className={() =>
                            `side-menu ${isDashboardActive ? 'side-menu--active' : ''}`
                        }
                    >
                        <div className="side-menu__icon">
                            <House className="stroke-1.5 w-5 h-5" />
                        </div>
                        <div className="side-menu__title">Dashboard</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/food-menus"
                        className={() =>
                            `side-menu ${isFoodMenuActive ? 'side-menu--active' : ''}`
                        }
                    >
                        <div className="side-menu__icon">
                            <CookingPot className="stroke-1.5 w-5 h-5" />
                        </div>
                        <div className="side-menu__title">Food Menus</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/employees"
                        className={() =>
                            `side-menu ${isEmployeesActive ? 'side-menu--active' : ''}`
                        }
                    >
                        <div className="side-menu__icon">
                            <UsersRound className="stroke-1.5 w-5 h-5" />
                        </div>
                        <div className="side-menu__title">Employees</div>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/attendance"
                        className={() =>
                            `side-menu ${isAttendanceActive ? 'side-menu--active' : ''}`
                        }
                    >
                        <div className="side-menu__icon">
                            <Speaker className="stroke-1.5 w-5 h-5" />
                        </div>
                        <div className="side-menu__title">Attendance</div>
                    </NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default Sidebar
