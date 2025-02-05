import React from "react";

const ArtistCard = ({ artist }) => (
  <div className="p-4 bg-gray-800 rounded-lg">
    <img src={artist.images[0]?.url} alt={artist.name} className="w-full h-40 object-cover rounded-md mb-4" />
    <h3 className="text-lg font-bold">{artist.name}</h3>
  </div>
);

export default ArtistCard;
