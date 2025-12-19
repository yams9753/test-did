
import React from 'react';
import { WalkStatus, ApplicationStatus } from '../types.ts';

interface Props {
  status: WalkStatus | ApplicationStatus;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MATCHED':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'OPEN': return '지원자 찾는 중';
      case 'MATCHED': return '산책 예정';
      case 'COMPLETED': return '산책 완료';
      case 'PENDING': return '지원 대기';
      case 'ACCEPTED': return '매칭됨';
      case 'REJECTED': return '거절됨';
      default: return status;
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStyles()}`}>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
