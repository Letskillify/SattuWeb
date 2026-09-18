import React from 'react';
import { UserCheck, Mail, Phone, Calendar } from 'lucide-react';

const UsersTable = ({ users }) => {
  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 border-b border-[#E5DEC9] bg-[#FDFBF7] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-poppins font-black text-[#2A1B12] tracking-tight">Registered Customers</h2>
          <p className="text-xs text-[#7A6E63] font-medium mt-1">Directory of registered store accounts</p>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-[#6b4f3a]/10 text-[#6b4f3a] border border-[#6b4f3a]/20 text-xs font-bold uppercase tracking-wider">
          {users.length} Active Users
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-[#F7F4EE] border-b border-[#E5DEC9]">
            <tr className="text-[11px] font-poppins font-black text-[#6b4f3a] uppercase tracking-widest">
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Contact Phone</th>
              <th className="px-6 py-4">Registration Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60">
            {users.map((user) => {
              const nameStr = user.displayName || user.name || "Registered User";
              const initials = nameStr.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

              return (
                <tr key={user.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-6 py-4 text-[#2A1B12] font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#6b4f3a]/10 text-[#6b4f3a] border border-[#6b4f3a]/20 flex items-center justify-center font-extrabold text-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="font-poppins font-bold text-xs text-[#2A1B12]">{nameStr}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <UserCheck size={11} /> Verified Account
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#7A6E63] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-[#976E2A]" />
                      {user.email || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#7A6E63] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[#976E2A]" />
                      {user.phone || "Not provided"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#7A6E63] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#976E2A]" />
                      {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[#7A6E63]">
                  No registered users found in Firestore.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsersTable;
