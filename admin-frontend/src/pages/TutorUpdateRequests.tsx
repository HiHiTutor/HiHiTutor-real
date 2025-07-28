import React, { useState, useEffect } from 'react';
import api from '../services/api';

// 簡單的 UI 組件，因為 admin-frontend 可能沒有完整的 UI 庫
const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="min-w-full border-collapse border border-gray-300">{children}</table>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50">{children}</tr>
);

const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>
);

const Button = ({ 
  children, 
  onClick, 
  disabled, 
  variant = 'default',
  size = 'default'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'default' | 'sm';
}) => {
  const baseClasses = "px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
  };
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white shadow rounded-lg">{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium text-gray-900">{children}</h3>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
);

const Badge = ({ 
  children, 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

const Dialog = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">{children}</div>
);

const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      {children}
    </div>
  </div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900">{children}</h3>
);

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <div>{children}</div>
);

const Textarea = ({ 
  value, 
  onChange, 
  placeholder,
  required
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder?: string;
  required?: boolean;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    rows={4}
  />
);

// 簡單的 toast 實現
const toast = {
  success: (message: string) => {
    alert(`✅ ${message}`);
  },
  error: (message: string) => {
    alert(`❌ ${message}`);
  }
};

interface TutorUpdateRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  pendingProfile: {
    name?: string;
    phone?: string;
    email?: string;
    tutorProfile?: any;
    documents?: any;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    adminRemarks?: string;
  };
  createdAt: string;
}

export default function TutorUpdateRequestsPage() {
  const [requests, setRequests] = useState<TutorUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TutorUpdateRequest | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 開始獲取待審批申請...');
      console.log('🔑 Admin token 存在:', !!localStorage.getItem('adminToken'));
      
      const response = await api.get('/tutor-update-requests');
      console.log('✅ API 回應:', response.data);
      
      if (response.data.success) {
        setRequests(response.data.data || []);
        console.log('📋 成功載入申請資料，共', response.data.data?.length || 0, '筆');
      } else {
        console.error('❌ API 回應失敗:', response.data);
        toast.error('獲取申請列表失敗');
      }
    } catch (error: any) {
      console.error('❌ 獲取待審批申請失敗:', error);
      console.error('❌ 錯誤詳情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error('獲取申請列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(true);
      await api.post(`/tutor-update-requests/${requestId}/approve`, {
        adminRemarks: approvalRemarks
      });
      toast.success('申請已審批通過');
      setApprovalRemarks('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('審批失敗:', error);
      toast.error('審批失敗');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(true);
      await api.delete(`/tutor-update-requests/${requestId}`, {
        data: { adminRemarks: rejectionRemarks }
      });
      toast.success('申請已拒絕');
      setRejectionRemarks('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('拒絕失敗:', error);
      toast.error('拒絕失敗');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">待審批</Badge>;
      case 'approved':
        return <Badge variant="default">已通過</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒絕</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>導師更新申請管理</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暫無待審批的申請
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>導師姓名</TableHead>
                  <TableHead>申請時間</TableHead>
                  <TableHead>申請內容</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{formatDate(request.pendingProfile.submittedAt)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {request.pendingProfile.name && (
                          <div>姓名: {request.pendingProfile.name}</div>
                        )}
                        {request.pendingProfile.phone && (
                          <div>電話: {request.pendingProfile.phone}</div>
                        )}
                        {request.pendingProfile.email && (
                          <div>電郵: {request.pendingProfile.email}</div>
                        )}
                        {request.pendingProfile.tutorProfile && (
                          <div>導師資料更新</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.pendingProfile.status)}
                    </TableCell>
                    <TableCell>
                      {request.pendingProfile.status === 'pending' && (
                        <div className="space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                審批
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>審批申請</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">申請詳情:</h4>
                                  <div className="space-y-1 text-sm">
                                    {request.pendingProfile.name && (
                                      <div>姓名: {request.pendingProfile.name}</div>
                                    )}
                                    {request.pendingProfile.phone && (
                                      <div>電話: {request.pendingProfile.phone}</div>
                                    )}
                                    {request.pendingProfile.email && (
                                      <div>電郵: {request.pendingProfile.email}</div>
                                    )}
                                    {request.pendingProfile.tutorProfile && (
                                      <div>導師資料更新</div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    審批備註 (可選)
                                  </label>
                                  <Textarea
                                    value={approvalRemarks}
                                    onChange={(e) => setApprovalRemarks(e.target.value)}
                                    placeholder="輸入審批備註..."
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleApprove(request._id)}
                                    disabled={processing}
                                  >
                                    {processing ? '處理中...' : '通過'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedRequest(null)}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                拒絕
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>拒絕申請</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    拒絕原因
                                  </label>
                                  <Textarea
                                    value={rejectionRemarks}
                                    onChange={(e) => setRejectionRemarks(e.target.value)}
                                    placeholder="請說明拒絕原因..."
                                    required
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReject(request._id)}
                                    disabled={processing || !rejectionRemarks.trim()}
                                  >
                                    {processing ? '處理中...' : '確認拒絕'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedRequest(null)}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 