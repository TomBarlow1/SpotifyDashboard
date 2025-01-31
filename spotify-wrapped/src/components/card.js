import React from 'react';

const Card = ({ image, title, subtitle }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center mb-4">
      <img src={image} alt={title} className="w-16 h-16 object-cover rounded-full mr-4" />
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
};

export default Card;