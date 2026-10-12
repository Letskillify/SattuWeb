import React, { useState, useMemo } from 'react';
import { db } from '../../../components/Firebase';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Search,
  UserPlus,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  MoreVertical
} from 'lucide-react';

const AccountsTable = ({ users = [], onUsersUpdated, currentUserEmail = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'admin' | 'customer'
  const [submittingId, setSubmittingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  
  // Add Admin Modal
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Determine if a user is an Admin
  const isUserAdmin = (u) => {
    if (!u) return false;
    if (u.role === "admin" || u.isAdmin === true) return true;
    const email = (u.email || "").toLowerCase();
    const currentAdmin = (currentUserEmail || localStorage.getItem("adminEmail") || "").toLowerCase();
    if (email === "vedamyafoods@gmail.com" || (currentAdmin && email === currentAdmin)) {
      // By default the root account is admin unless explicitly demoted to customer
      return u.role !== "customer";
    }
    return false;
  };

  // Toggle or Update Admin Role in Firestore
  const handleToggleAdminRole = async (targetUser, shouldBeAdmin) => {
    const targetEmail = targetUser.email || targetUser.displayName || "User";
    const actionLabel = shouldBeAdmin ? "Grant Admin Rights" : "Remove Admin Rights";

    if (!window.confirm(`Are you sure you want to ${actionLabel} for ${targetEmail}?`)) {
      return;
    }

    setSubmittingId(targetUser.id);
    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        role: shouldBeAdmin ? "admin" : "customer",
        isAdmin: shouldBeAdmin,
        updatedAt: serverTimestamp()
      });

      setFeedback({
        type: "success",
        message: shouldBeAdmin
          ? `✓ Granted Administrator privileges to ${targetEmail}!`
          : `✓ Removed Administrator privileges from ${targetEmail}.`
      });

      if (onUsersUpdated) await onUsersUpdated();
    } catch (err) {
      console.error("Error updating user role:", err);
      setFeedback({
        type: "error",
        message: "Failed to update account role: " + err.message
      });
    } finally {
      setSubmittingId(null);
      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    }
  };

  // Add / Grant Admin by Email
  const handleAddAdminByEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    setAddingAdmin(true);
    try {
      // Check if user exists in Firestore
      const q = query(collection(db, "users"), where("email", "==", cleanEmail));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // User exists -> update to admin
        const targetDoc = snap.docs[0];
        await updateDoc(doc(db, "users", targetDoc.id), {
          role: "admin",
          isAdmin: true,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create pre-approved admin entry
        await addDoc(collection(db, "users"), {
          email: cleanEmail,
          displayName: cleanEmail.split("@")[0],
          role: "admin",
          isAdmin: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setFeedback({
        type: "success",
        message: `Admin access granted to ${cleanEmail}!`
      });
      setIsAddAdminModalOpen(false);
      setNewAdminEmail("");
      if (onUsersUpdated) await onUsersUpdated();
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: "Failed to grant admin: " + err.message
      });
    } finally {
      setAddingAdmin(false);
      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.displayName?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);

      const isAdmin = isUserAdmin(u);
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && isAdmin) ||
        (roleFilter === "customer" && !isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter, currentUserEmail]);

  // Counts
  const adminCount = users.filter(isUserAdmin).length;
  const customerCount = users.length - adminCount;

  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden space-y-0">
      
      {/* FEEDBACK TOAST */}
      {feedback.message && (
        <div
          className={`p-4 mx-6 mt-6 rounded-2xl flex items-center justify-between text-sm font-bold shadow-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: "", message: "" })} className="p-1 hover:opacity-75 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="p-6 md:p-8 border-b border-[#E5DEC9] bg-[#FDFBF7] space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#976E2A]/15 text-[#976E2A] text-xs font-poppins font-black uppercase tracking-widest border border-[#976E2A]/30 flex items-center gap-1.5 shadow-2xs">
                <Shield size={13} /> Account Directory
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-poppins font-black text-[#2A1B12] tracking-tight">
              Account Management
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">
              Manage registered store members and administrative privileges
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddAdminModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#D9A036] text-[#1A1009] text-xs sm:text-sm font-poppins font-black shadow-md shadow-[#D9A036]/20 hover:bg-[#C68A27] transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            <span>Grant Admin Access</span>
          </button>
        </div>

        {/* CONTROLS & FILTER ROW */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-1">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none py-2.5 pl-11 pr-4 rounded-2xl text-sm font-semibold text-[#2A1B12] transition-all shadow-xs"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5DEC9] rounded-2xl shadow-xs w-full lg:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                roleFilter === "all"
                  ? "bg-[#2A1B12] text-white shadow-xs"
                  : "text-[#7A6E63] hover:text-[#2A1B12]"
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                roleFilter === "admin"
                  ? "bg-[#D9A036] text-[#1A1009] shadow-xs"
                  : "text-[#7A6E63] hover:text-[#2A1B12]"
              }`}
            >
              <ShieldCheck size={14} />
              <span>Admins ({adminCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("customer")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                roleFilter === "customer"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[#7A6E63] hover:text-[#2A1B12]"
              }`}
            >
              <UserCheck size={14} />
              <span>Customers ({customerCount})</span>
            </button>
          </div>

        </div>

      </div>

      {/* TABLE BODY */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm font-sans">
          <thead className="bg-[#F7F4EE] border-b border-[#E5DEC9]">
            <tr className="text-xs font-poppins font-black text-[#6b4f3a] uppercase tracking-wider">
              <th className="px-6 py-4.5">Account Info</th>
              <th className="px-6 py-4.5">Contact Details</th>
              <th className="px-6 py-4.5">Role & Status</th>
              <th className="px-6 py-4.5">Registered On</th>
              <th className="px-6 py-4.5 text-right">Admin Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60">
            {filteredUsers.map((user) => {
              const nameStr = user.displayName || user.name || "Registered User";
              const initials = nameStr.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              const isAdmin = isUserAdmin(user);
              const isSubmitting = submittingId === user.id;

              return (
                <tr key={user.id} className="hover:bg-[#FDFBF7] transition-colors group">
                  
                  {/* Account Info */}
                  <td className="px-6 py-4.5 text-[#2A1B12]">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shadow-xs border transition-transform group-hover:scale-105 ${
                          isAdmin
                            ? "bg-gradient-to-br from-[#D9A036]/20 to-[#976E2A]/30 text-[#976E2A] border-[#D9A036]/40"
                            : "bg-[#6b4f3a]/10 text-[#6b4f3a] border-[#6b4f3a]/25"
                        }`}
                      >
                        {initials}
                      </div>

                      <div>
                        <div className="font-poppins font-bold text-sm text-[#2A1B12] flex items-center gap-2">
                          <span>{nameStr}</span>
                          {isAdmin && (
                            <span className="w-2 h-2 rounded-full bg-[#D9A036] shadow-[0_0_6px_#D9A036]" />
                          )}
                        </div>
                        <div className="text-xs text-[#7A6E63] font-semibold mt-0.5">
                          ID: #{user.id?.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Details */}
                  <td className="px-6 py-4.5 text-[#7A6E63] font-medium text-xs sm:text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#2A1B12] font-semibold">
                        <Mail size={14} className="text-[#976E2A] shrink-0" />
                        <span className="truncate max-w-[220px]">{user.email || "No email on record"}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-xs text-[#7A6E63]">
                          <Phone size={13} className="text-[#976E2A] shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#D9A036]/15 text-[#976E2A] border border-[#D9A036]/35 shadow-2xs">
                        <ShieldCheck size={14} className="text-[#D9A036]" />
                        <span>Administrator</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <UserCheck size={14} className="text-emerald-700" />
                        <span>Customer</span>
                      </span>
                    )}
                  </td>

                  {/* Registered Date */}
                  <td className="px-6 py-4.5 text-[#7A6E63] font-semibold text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#976E2A]" />
                      <span>
                        {user.createdAt
                          ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "Active Account"}
                      </span>
                    </span>
                  </td>

                  {/* Admin Action Toggle */}
                  <td className="px-6 py-4.5 text-right">
                    {isAdmin ? (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleToggleAdminRole(user, false)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 shadow-2xs hover:shadow-sm"
                        title="Demote this user to standard customer"
                      >
                        {isSubmitting ? (
                          <RefreshCw size={13} className="animate-spin inline mr-1" />
                        ) : (
                          <ShieldAlert size={13} className="inline mr-1" />
                        )}
                        <span>Remove Admin</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleToggleAdminRole(user, true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-[#FAF7F2] text-[#976E2A] hover:bg-[#D9A036] hover:text-[#1A1009] border border-[#E5DEC9] hover:border-[#D9A036] shadow-2xs hover:shadow-sm"
                        title="Promote this customer to store administrator"
                      >
                        {isSubmitting ? (
                          <RefreshCw size={13} className="animate-spin inline mr-1" />
                        ) : (
                          <ShieldCheck size={13} className="inline mr-1" />
                        )}
                        <span>Make Admin</span>
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-[#7A6E63]">
                  <div className="max-w-xs mx-auto space-y-2">
                    <UserX size={32} className="mx-auto text-amber-600 opacity-60" />
                    <p className="font-extrabold text-base text-[#2A1B12]">No Accounts Found</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      No accounts matched your search or role filter.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* GRANT ADMIN MODAL */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/75 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-md w-full border border-[#E5DEC9] p-7 space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D9A036]/20 text-[#976E2A] flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-poppins font-black text-[#2A1B12]">
                    Grant Admin Access
                  </h3>
                  <p className="text-xs text-[#7A6E63] font-semibold mt-0.5">
                    Assign administrator role by email
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddAdminModalOpen(false)}
                className="p-1.5 hover:bg-[#E5DEC9] rounded-xl text-[#7A6E63]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdminByEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                  Admin Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. manager@vedamya.com"
                  className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12]"
                />
                <p className="text-[11px] text-[#7A6E63] font-medium mt-1">
                  If the account exists, it will be upgraded immediately. If not yet registered, admin rights will be pre-assigned.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#7A6E63]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="px-5 py-2.5 rounded-xl bg-[#D9A036] text-[#1A1009] text-xs font-black shadow-md hover:bg-[#C68A27] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {addingAdmin && <RefreshCw size={13} className="animate-spin" />}
                  <span>Confirm Admin Rights</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
};

export default AccountsTable;
