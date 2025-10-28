import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-6">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-300 border-t-transparent"></div>
    </div>
  );
};

export default Spinner;