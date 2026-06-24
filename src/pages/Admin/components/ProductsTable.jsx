import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const statusBadgeClasses = (status) => {
  switch (status) {
    case "In Stock":
      return "bg-[#4A5D4E]/10 text-[#4A5D4E] border-[#4A5D4E]/20";
    case "Low Stock":
      return "bg-[#D9A036]/10 text-[#D9A036] border-[#D9A036]/20";
    default:
      return "bg-red-100 text-red-700 border-red-200";
  }
};

const ProductsTable = ({ products, onEdit, onDelete }) => {
  return (
    <section className="bg-white rounded-2xl border border-[#D9D3C7] shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-[#D9D3C7]">
        <div>
          <h2 className="text-lg font-poppins font-bold text-[#1C2B21]">Sattu Products</h2>
          <p className="text-sm text-[#707A72] mt-1">
            Manage your sattu drink catalog
          </p>
        </div>
        <span className="px-4 py-2 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-sm font-bold">
          {products.length} Products
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#EFECE6]">
            <tr className="text-sm font-bold text-[#4A5D4E] uppercase tracking-wide">
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Flavor</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C7]">
            {products.map((row) => (
              <tr key={row.id} className="hover:bg-[#FDFBF7] transition-colors">
                <td className="px-6 py-4 text-[#1C2B21] font-medium">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-[#707A72]">
                  {row.flavor || "-"}
                </td>
                <td className="px-6 py-4 text-[#1C2B21] font-semibold">
                  ₹{Number(row.price || 0).toFixed(0)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-bold ${statusBadgeClasses(row.stock_status || "In Stock")}`}
                  >
                    {row.stock_status || "In Stock"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="p-2.5 rounded-lg bg-[#EFECE6] text-[#6b4f3] hover:bg-[#D9D3C7] transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-[#707A72]"
                >
                  No products yet. Click &quot;Add Product&quot; to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProductsTable;
