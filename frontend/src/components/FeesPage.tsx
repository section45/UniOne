import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { feesAPI, studentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  IndianRupee, 
  Calendar, 
  User, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  Receipt,
  Trash2
} from 'lucide-react';

interface FeePayment {
  id: number;
  student_id: number;
  student_name?: string;
  amount: number;
  fee_type: string;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  created_at: string;
}

interface Student {
  id: number;
  name: string;
  grade: string;
}

const FeesPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const [fees, setFees] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeePayment | null>(null);
  
  const [feeForm, setFeeForm] = useState({
    student_id: '',
    amount: '',
    fee_type: '',
    due_date: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'cash',
    paid_date: new Date().toISOString().split('T')[0],
  });

  const feeTypes = [
    'Tuition Fee',
    'Library Fee',
    'Laboratory Fee',
    'Sports Fee',
    'Transportation Fee',
    'Examination Fee',
    'Activity Fee',
    'Miscellaneous'
  ];

  const paymentMethods = ['cash', 'check', 'bank_transfer', 'online', 'card'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, studentsRes] = await Promise.all([
        feesAPI.getAll(),
        isTeacher ? studentAPI.getAll() : Promise.resolve({ data: [] })
      ]);
      
      setFees(feesRes.data);
      if (isTeacher) {
        setStudents(studentsRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch fees data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feesAPI.create({
        ...feeForm,
        amount: parseFloat(feeForm.amount),
        student_id: parseInt(feeForm.student_id),
        status: 'pending'
      });
      
      toast.success('Fee record created successfully');
      setShowAddFee(false);
      setFeeForm({ student_id: '', amount: '', fee_type: '', due_date: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create fee record');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      await feesAPI.addPayment({
        fee_id: selectedFee.id,
        payment_method: paymentForm.payment_method,
        paid_date: paymentForm.paid_date
      });
      
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedFee(null);
      setPaymentForm({ payment_method: 'cash', paid_date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleDeleteFee = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await feesAPI.delete(id);
        toast.success('Fee record deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete fee record');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

const getTotalStats = () => {
  const safeAmount = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const total = fees.reduce((sum, fee) => sum + safeAmount(fee.amount), 0);
  const paid = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + safeAmount(fee.amount), 0);
  const pending = fees.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + safeAmount(fee.amount), 0);
  const overdue = fees.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + safeAmount(fee.amount), 0);

  return { total, paid, pending, overdue };
};


  const stats = getTotalStats();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {isTeacher ? 'Fees Management' : 'Fee Records'}
        </h2>
        {isTeacher && (
          <button
            onClick={() => setShowAddFee(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fee Record
          </button>
        )}
      </div>

      {/* Fee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(stats.total).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(stats.paid).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
             <p className="text-2xl font-bold text-gray-900">₹{Number(stats.pending).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(stats.overdue).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Fee Form */}
      {isTeacher && showAddFee && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add New Fee Record</h3>
          <form onSubmit={handleAddFee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                value={feeForm.student_id}
                onChange={(e) => setFeeForm({...feeForm, student_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name} - {student.grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
              <select
                value={feeForm.fee_type}
                onChange={(e) => setFeeForm({...feeForm, fee_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Fee Type</option>
                {feeTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={feeForm.due_date}
                onChange={(e) => setFeeForm({...feeForm, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="md:col-span-2 flex gap-4">
              <button
                type="button"
                onClick={() => setShowAddFee(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Fee Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Fee: {selectedFee.fee_type}</p>
              <p className="text-sm text-gray-600">Amount: ₹{Number(selectedFee.amount).toFixed(2)}</p>

              <p className="text-sm text-gray-600">Student: {selectedFee.student_name}</p>
            </div>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paid_date}
                  onChange={(e) => setPaymentForm({...paymentForm, paid_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedFee(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fee Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                {isTeacher && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{fee.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fee.fee_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{Number(fee.amount).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.due_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(fee.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                        {fee.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.paid_date || '-'}
                  </td>
                  {isTeacher && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {fee.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setShowPaymentModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFee(fee.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fees.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No fee records found</p>
            {isTeacher && (
              <p className="text-sm text-gray-400 mt-2">Click "Add Fee Record" to create the first record</p>
            )}
          </div>
        )}
      </div>

      {/* Payment Summary for Parents */}
      {!isTeacher && fees.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{stats.paid.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">₹{stats.pending.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">₹{stats.overdue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;