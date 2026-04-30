import React, { useState } from "react";
import {
  useGetVehiclesQuery,
  useGetStaffQuery,
} from "../../features/api/adminApiSlice";
import {
  Loader2,
  AlertCircle,
  Truck,
  Users,
  Activity,
  CheckCircle,
  Navigation,
  ClipboardList,
  PenTool,
  Calendar,
} from "lucide-react";

// Import Tab Components
import VehiclesTab from "./fleet/VehiclesTab";
import StaffTab from "./fleet/StaffTab";
import AssignmentTab from "./fleet/AssignmentTab";
import TripsTab from "./fleet/TripsTab";
import MaintenanceTab from "./fleet/MaintenanceTab";
import AttendanceTab from "./fleet/AttendanceTab";

const FleetDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // We still fetch these here JUST for the dashboard summary figures
  const {
    data: vehiclesData,
    isLoading: loadingVehicles,
    isError: errorVehicles,
  } = useGetVehiclesQuery({ page: 1 });
  const {
    data: staffData,
    isLoading: loadingStaff,
    isError: errorStaff,
  } = useGetStaffQuery({ page: 1 });

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: Activity },
    { id: "vehicles", name: "Vehicles", icon: Truck },
    { id: "staff", name: "Staff", icon: Users },
    { id: "assignments", name: "Assignments", icon: ClipboardList },
    { id: "trips", name: "Delivery Trips", icon: Navigation },
    { id: "maintenance", name: "Maintenance", icon: PenTool },
    { id: "attendance", name: "Attendance", icon: Calendar },
  ];

  if (loadingVehicles || loadingStaff) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-electric w-12 h-12" />
      </div>
    );
  }

  if (errorVehicles || errorStaff) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Failed to load data
        </h2>
        <p className="text-slate-500 mb-6">
          There was an error fetching fleet or staff information.
        </p>
      </div>
    );
  }

  const vehicles = vehiclesData?.data || [];
  const staff = staffData?.data || [];
  const activeVehicles = vehicles.filter(
    (v) => v.status === "assigned" || v.status === "available",
  ).length;
  const activeStaff = staff.filter((s) => s.isActive && s.isAvailable).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-electric" /> Fleet & Staff Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage delivery vehicles, drivers, logistics, and staff operations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-electric text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Total Vehicles
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {vehicles.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Active Vehicles
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {activeVehicles}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Total Staff
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {staff.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Available Staff
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {activeStaff}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-slate-400" /> Recent Vehicles
                </h2>
              </div>
              <div className="p-0 overflow-y-auto flex-1">
                {vehicles.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                    <Navigation className="w-10 h-10 mb-3 opacity-20" />
                    <p>No vehicles found.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {vehicles.slice(0, 10).map((v) => (
                      <li
                        key={v._id}
                        className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {v.registrationNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            {v.type || "Vehicle"} - {v.make} {v.model}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            v.status === "available"
                              ? "bg-emerald-100 text-emerald-700"
                              : v.status === "assigned"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {v.status || "Unknown"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" /> Recent Staff
                </h2>
              </div>
              <div className="p-0 overflow-y-auto flex-1">
                {staff.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                    <Users className="w-10 h-10 mb-3 opacity-20" />
                    <p>No staff found.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {staff.slice(0, 10).map((s) => (
                      <li
                        key={s._id}
                        className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.role || "Staff"} • {s.employeeId}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            s.isAvailable
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "vehicles" && <VehiclesTab />}
      {activeTab === "staff" && <StaffTab />}
      {activeTab === "assignments" && <AssignmentTab />}
      {activeTab === "trips" && <TripsTab />}
      {activeTab === "maintenance" && <MaintenanceTab />}
      {activeTab === "attendance" && <AttendanceTab />}
    </div>
  );
};

export default FleetDashboard;
