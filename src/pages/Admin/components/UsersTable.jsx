import React from 'react';
import { UserCheck, Mail, Phone, Calendar } from 'lucide-react';

const UsersTable = ({ users }) => {
  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#E5DEC9] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12] tracking-tight">Registered Customers</h2>
          <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">Directory of registered store accounts</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-[#6b4f3a]/15 text-[#6b4f3a] border border-[#6b4f3a]/30 text-xs sm:text-sm font-extrabold uppercase tracking-wider self-start sm:self-auto shadow-2xs">
          {users.length} Active Users
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F7F4EE] border-b border-[#E5DEC9]">
            <tr className="text-xs font-poppins font-black text-[#6b4f3a] uppercase tracking-wider">
              <th className="px-6 py-4.5">Customer Name</th>
              <th className="px-6 py-4.5">Email Address</th>
              <th className="px-6 py-4.5">Contact Phone</th>
              <th className="px-6 py-4.5">Registration Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60">
            {users.map((user) => {
              const nameStr = user.displayName || user.name || "Registered User";
              const initials = nameStr.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

              return (
                <tr key={user.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-6 py-4.5 text-[#2A1B12] font-bold">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#6b4f3a]/15 text-[#6b4f3a] border border-[#6b4f3a]/30 flex items-center justify-center font-black text-xs sm:text-sm shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="font-poppins font-bold text-sm text-[#2A1B12]">{nameStr}</div>
                        <div className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                          <UserCheck size={13} /> Verified Account
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-[#7A6E63] font-semibold text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Mail size={15} className="text-[#976E2A]" />
                      {user.email || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-[#7A6E63] font-semibold text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Phone size={15} className="text-[#976E2A]" />
                      {user.phone || "Not provided"}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-[#7A6E63] font-semibold text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar size={15} className="text-[#976E2A]" />
                      {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#7A6E63] text-sm font-semibold">
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
