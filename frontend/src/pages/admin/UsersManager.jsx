import { useState, useEffect } from "react";
import { getAllUsers, deleteUser } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await getAllUsers();
      setUsers(res.users || res.data || []);
    } catch (err) {
      toast("Failed to load users", "err");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (id === currentUser._id || id === currentUser.id) {
      toast("You cannot delete your own account", "err");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await deleteUser(id);
      toast("User deleted", "ok");
      fetchUsers();
    } catch (err) {
      toast("Failed to delete user", "err");
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Users Manager</h2>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--muted)" }}>
              <th style={{ padding: 15 }}>Name</th>
              <th style={{ padding: 15 }}>Email</th>
              <th style={{ padding: 15 }}>Role</th>
              <th style={{ padding: 15 }}>Joined Date</th>
              <th style={{ padding: 15 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" style={{ padding: 20, textAlign: "center" }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: 20, textAlign: "center" }}>No users found</td></tr>
            ) : (
              users.map(u => {
                const isSelf = u._id === currentUser?._id || u.id === currentUser?.id;
                return (
                  <tr key={u._id || u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 15 }}>{u.name} {isSelf && <span style={{ color: "var(--gold)", fontSize: 12, marginLeft: 8 }}>(You)</span>}</td>
                    <td style={{ padding: 15, color: "var(--muted)" }}>{u.email}</td>
                    <td style={{ padding: 15 }}>
                      <span style={{ 
                        padding: "4px 8px", 
                        background: u.role === "admin" ? "rgba(232, 224, 208, 0.1)" : "transparent",
                        color: u.role === "admin" ? "var(--gold)" : "var(--foreground)",
                        border: "1px solid",
                        borderColor: u.role === "admin" ? "var(--gold)" : "var(--border)",
                        borderRadius: 12,
                        fontSize: 12 
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: 15, color: "var(--muted)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: 15 }}>
                      <button 
                        disabled={isSelf}
                        onClick={() => handleDelete(u._id || u.id)} 
                        style={{ 
                          padding: "6px 12px", 
                          background: "transparent", 
                          color: isSelf ? "var(--muted)" : "#c0392b", 
                          border: '1px solid ' + (isSelf ? "var(--muted)" : "#c0392b"), 
                          borderRadius: 4, 
                          cursor: isSelf ? "not-allowed" : "pointer",
                          fontSize: 12 
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManager;