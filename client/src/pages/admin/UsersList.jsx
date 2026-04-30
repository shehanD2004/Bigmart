import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useResetUserPasswordMutation,
} from "../../features/api/adminApiSlice";
import {
  Plus,
  Search,
  Pencil,
  Ban,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Save,
  KeyRound,
} from "lucide-react";

const UsersList = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' means all, 'true' active, 'false' inactive

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "customer",
    password: "",
  });
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading } = useGetUsersQuery({
    page,
    search: debouncedSearch,
    role: roleFilter || undefined,
    isActive: statusFilter === "" ? undefined : statusFilter,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const [resetUserPass, { isLoading: isResetting }] =
    useResetUserPasswordMutation();

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "customer", password: "" });
    }
    setIsModalOpen(true);
  };

  const handleOpenResetModal = (user) => {
    setResetUser(user);
    setResetPassword("");
    setIsResetModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Exclude password when updating
        const { password, ...updateData } = formData;
        await updateUser({ id: editingUser._id, ...updateData }).unwrap();
      } else {
        if (formData.password?.length < 6) {
          return alert("Password must be at least 6 characters");
        }
        await createUser(formData).unwrap();
        setPage(1); // Return to first page to see new creation
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || "Failed to save user");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetPassword.length < 6)
      return alert("Password must be at least 6 characters");
    try {
      await resetUserPass({
        id: resetUser._id,
        newPassword: resetPassword,
      }).unwrap();
      alert("Password reset successfully");
      setIsResetModalOpen(false);
    } catch (err) {
      alert(err.data?.message || "Failed to reset password");
    }
  };

  const handleToggle = async (user) => {
    if (user._id === currentUser._id)
      return alert("You cannot deactivate yourself");
    const action = user.isActive ? "deactivate" : "reactivate";
    if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      try {
        await toggleStatus({ id: user._id, isActive: !user.isActive }).unwrap();
      } catch (err) {
        alert(err.data?.message || "Failed to toggle status");
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-electric w-12 h-12" />
      </div>
    );

  const users = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Users Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage system access, roles, and user accounts.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all text-sm"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm font-medium text-slate-700 min-w-[140px]"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="warehouse_mgr">Warehouse Mgr</option>
              <option value="supplier">Supplier</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm font-medium text-slate-700 min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Users className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                No users found
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="text-electric font-semibold hover:text-electric-dark"
              >
                + Add a new user
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">User Details</th>
                  <th className="p-4 px-6">Role</th>
                  <th className="p-4 px-6 text-center">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isCurrent = user._id === currentUser._id;
                  return (
                    <tr
                      key={user._id}
                      className={`hover:bg-slate-50/80 transition-colors group ${!user.isActive ? "bg-slate-50/50 grayscale-[0.5] opacity-80" : ""}`}
                    >
                      <td className="p-4 px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {user.name}
                          {isCurrent && (
                            <span className="text-[10px] bg-electric/10 text-electric px-2 py-0.5 rounded-full uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <span className="capitalize font-medium text-slate-700 text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${user.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenResetModal(user)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={isCurrent}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.isActive ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                            title={user.isActive ? "Deactivate" : "Reactivate"}
                          >
                            {user.isActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-900">{pagination.page}</span> of{" "}
              <span className="text-slate-900">{pagination.pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Name*
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Email*
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Initial Password*
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Role*
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="warehouse_mgr">Warehouse Mgr</option>
                  <option value="supplier">Supplier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-[1.5] py-3.5 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}{" "}
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-heading font-extrabold text-slate-900">
                Reset Password
              </h2>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-2">
                Enter a new minimum 6-character password for{" "}
                <strong>{resetUser?.name}</strong>.
              </p>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  New Password*
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70"
                >
                  {isResetting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <KeyRound size={16} />
                  )}{" "}
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
