import React from "react";

const TrackCard = ({ track }) => (
  <div className="p-4 bg-gray-800 rounded-lg">
    <img src={track.album.images[0].url} alt={track.name} className="w-full h-40 object-cover rounded-md mb-4" />
    <h3 className="text-lg font-bold">{track.name}</h3>
    <p className="text-sm text-gray-400">{track.artists[0].name}</p>
  </div>
);

export default TrackCard;
