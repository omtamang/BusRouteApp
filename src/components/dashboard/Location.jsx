import React, { useState } from "react";
import { useFormik } from "formik";

const Location = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [coordinates, setCoordinates] = useState(null);

  const LOCATIONIQ_API_KEY = "pk.abc77c9c4d1bf2a25c28c2579bf8bb45";

  const formik = useFormik({
    initialValues: {
      address: "",
    },
    onSubmit: (values) => {
      console.log("Final Address:", values.address);
      console.log("Coordinates:", coordinates);
    },
  });

  const fetchSuggestions = async (query) => {
    if (query.length > 2) {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_API_KEY}&q=${query}&limit=5&format=json`
      );
      const data = await response.json();
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">Enter Address</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-3">
        <input
          type="text"
          name="address"
          value={formik.values.address}
          onChange={(e) => {
            formik.handleChange(e);
            fetchSuggestions(e.target.value);
          }}
          placeholder="Search address"
          className="w-full p-2 border rounded"
        />

        {suggestions.length > 0 && (
          <ul className="bg-white border rounded shadow">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  formik.setFieldValue("address", item.display_name);
                  setCoordinates({ lat: item.lat, lon: item.lon });
                  setSuggestions([]);
                }}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Submit
        </button>
      </form>

      {coordinates && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lon}</p>
        </div>
      )}
    </div>
  );
};

export default Location;
