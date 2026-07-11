import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { auth } from "../../firebase";
import { apiUrl } from "../../lib/api";
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(apiUrl("/api/admin/users"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(apiUrl(`/api/admin/users/${uid}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.uid !== uid));
      } else {
        alert("Failed to delete user: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };
  return (
    <div>
      {" "}
      <h1 className="text-3xl font-bold text-[#0D0D12] mb-6">Manage Users</h1>{" "}
      {loading ? (
        <div className="text-text-muted">Loading users...</div>
      ) : (
        <div className="glass-card overflow-hidden">
          {" "}
          <div className="overflow-x-auto custom-scrollbar">
            {" "}
            <table className="w-full min-w-[640px] text-left border-collapse">
              {" "}
              <thead>
                {" "}
                <tr className="bg-brand-bg border-b border-border-subtle">
                  {" "}
                  <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider">
                    Name
                  </th>{" "}
                  <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider">
                    Email
                  </th>{" "}
                  <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider">
                    Created
                  </th>{" "}
                  <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider text-right">
                    Actions
                  </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b border-gray-50 hover:bg-brand-bg/80 transition-colors duration-200 transition-colors"
                  >
                    {" "}
                    <td className="p-4 text-[#0D0D12] font-medium">
                      {user.displayName || "No Name"}
                    </td>{" "}
                    <td className="p-4 text-text-muted">{user.email}</td>{" "}
                    <td className="p-4 text-text-muted text-sm">
                      {new Date(user.creationTime).toLocaleDateString()}
                    </td>{" "}
                    <td className="p-4 text-right">
                      {" "}
                      {user.email !== "admin@collagecampus.com" && (
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="text-[#B3261E] hover:text-[#B3261E] bg-red-50 hover:bg-error p-2.5 min-w-[44px] min-h-[44px] rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Delete User"
                        >
                          {" "}
                          <FaTrashAlt />{" "}
                        </button>
                      )}{" "}
                    </td>{" "}
                  </tr>
                ))}{" "}
                {users.length === 0 && (
                  <tr>
                    {" "}
                    <td colSpan="4" className="p-8 text-center text-text-muted">
                      No users found.
                    </td>{" "}
                  </tr>
                )}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
