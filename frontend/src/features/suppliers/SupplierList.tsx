import { useGetSuppliersQuery } from '../../store/api/suppliersApi';
import { Card } from '../../components/ui/Card';

export default function SupplierList() {
  // RTK Query returns { data, isLoading, error }
  // data is now PaginatedResponse<Supplier> | undefined
  const { data, isLoading, error } = useGetSuppliersQuery();

  if (isLoading) return <div>Loading suppliers...</div>;
  if (error) return <div>Error loading suppliers.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Add Supplier
        </button>
      </div>

      <Card>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Legal Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Map over data.results instead of just data */}
            {data?.results?.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.supplier_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.legal_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.tax_id || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    supplier.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supplier.city ? `${supplier.city}, ${supplier.country}` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}