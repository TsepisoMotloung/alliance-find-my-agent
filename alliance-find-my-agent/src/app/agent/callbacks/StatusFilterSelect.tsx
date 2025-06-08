'use client';

import { useRouter } from 'next/navigation';

interface StatusFilterSelectProps {
  currentStatus: string;
  pendingCount: number;
  scheduledCount: number;
  completedCount: number;
  cancelledCount: number;
}

export default function StatusFilterSelect({
  currentStatus,
  pendingCount,
  scheduledCount,
  completedCount,
  cancelledCount
}: StatusFilterSelectProps) {
  const router = useRouter();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === 'all') {
      router.push('/agent/callbacks');
    } else {
      router.push(`/agent/callbacks?status=${newStatus}`);
    }
  };

  return (
    <select
      id="tabs"
      name="tabs"
      className="block w-full rounded-md border-alliance-gray-300 focus:border-alliance-red-500 focus:ring-alliance-red-500"
      value={currentStatus}
      onChange={handleStatusChange}
    >
      <option value="all">All</option>
      <option value="pending">Pending ({pendingCount})</option>
      <option value="scheduled">Scheduled ({scheduledCount})</option>
      <option value="completed">Completed ({completedCount})</option>
      <option value="cancelled">Cancelled ({cancelledCount})</option>
    </select>
  );
}