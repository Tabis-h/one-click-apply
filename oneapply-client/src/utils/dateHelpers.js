// Date utility functions for profile page

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

export const formatDateRange = (startDate, endDate, isCurrent = false) => {
  const start = formatDate(startDate);
  const end = isCurrent ? 'Present' : formatDate(endDate);
  return `${start} - ${end}`;
};

export const calculateDuration = (startDate, endDate, isCurrent = false) => {
  const start = new Date(startDate);
  const end = isCurrent ? new Date() : new Date(endDate);
  
  const diffTime = Math.abs(end - start);
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const isValidDateRange = (startDate, endDate, isCurrent = false) => {
  if (!startDate) return false;
  if (!isCurrent && !endDate) return false;
  
  const start = new Date(startDate);
  const end = isCurrent ? new Date() : new Date(endDate);
  
  return start <= end;
};