import React, { useState, useEffect } from 'react';
import './HotelList.css'; // Import the CSS file for styling
import HotelDetailsModal from './HotelDetailsModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

// const baseUrl = 'https://food-app-be-sequelize-6i8s.onrender.com';
const baseUrl = 'http://localhost:3001';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [countsDetails, setCountDetails] = useState({});
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const category = [
    { 'Name': 'NonVeg', 'ID': 'NonVeg' },
    { 'Name': 'Veg', 'ID': 'Veg' },
    { 'Name': 'Beverage', 'ID': 'Beverage' },
    { 'Name': 'Cafe', 'ID': 'Cafe' },
    { 'Name': 'Snacks', 'ID': 'Snacks' },
    { 'Name': 'Fast Food', 'ID': 'Fast Food' },
    { 'Name': 'Deserts', 'ID': 'Deserts' },
    { 'Name': 'RestoBar', 'ID': 'RestoBar' }
  ];

  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingHotelId, setEditingHotelId] = useState(null); // Track which hotel is being edited
  const [editedHotel, setEditedHotel] = useState(null); // Track the edited hotel data
  const [loadingHotelIds, setLoadingHotelIds] = useState([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Fetch hotels data from the API
  const fetchHotels = async () => {
    try {
      setLoading(true);

      const url = `${baseUrl}/gethotels`;

      const queryParams = new URLSearchParams();
        
      if (showVerifiedOnly) {
          queryParams.append('verified', showVerifiedOnly);
      }

      if (searchTerm) {
        queryParams.append('userMobileNumber', searchTerm);
      }

      if (selectedDate) {
        queryParams.append('createdDate', selectedDate);
      }

      const finalUrl = queryParams.toString() ? `${url}?${queryParams}` : url;

      console.log(finalUrl);
      

      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHotels(data);
      setFilteredHotels(data); // Set filtered hotels initially to all hotels
      setError(null); 
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [showVerifiedOnly, selectedDate, searchTerm]);

  // Handle checkbox change for filtering
  const handleCheckboxChange = (e) => {
    setShowVerifiedOnly(e.target.checked);
  };

  // Handle approve action
  const handleApprove = async (hotelId, valid, duplicateVideoData = false) => {
    setLoadingHotelIds((prev) => [...prev, hotelId]);
    try {
      const response = await fetch(`${baseUrl}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: hotelId,
          verified: true,
          valid: valid,
          hotelVideoData: duplicateVideoData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve the hotel');
      }
      console.log(`Hotel with ID ${hotelId} approved.`);
      alert(`Hotel with ID ${hotelId} approved.`);
      // Optionally, refetch hotels or update the local state
      fetchHotels();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingHotelIds((prev) => prev.filter((id) => id !== hotelId)); // Remove hotel ID from loading list
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Handle search input change
  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue?.trim());
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // // Function to filter hotels by userMobileNumber and vlogPostDate
  // const filterHotels = (searchValue, date) => {  
  //   const filtered = hotels.filter((hotel) => {
  //     const matchesSearch = hotel.userMobileNumber.includes(searchValue);
  //     const matchesDate = date ? new Date(hotel.createdDate).toDateString() === date.toDateString() : true;

  //     return matchesSearch && matchesDate;
  //   });

  //   setHotels(filtered);
  // };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
  };

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const handleEditClick = (hotel) => {
    setEditingHotelId(hotel.hotelId);
    setEditedHotel({ ...hotel });
  };

  const handleSaveClick = async () => {
    // Update the hotel with editedHotel data
    const updatedHotels = hotels.map((hotel) =>
      hotel.hotelId === editingHotelId ? editedHotel : hotel
    );
    setLoadingHotelIds((prev) => [...prev, editingHotelId]);
    try {
      const response = await fetch(`${baseUrl}/updateHotel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedHotel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update the hotel details');
      }
      console.log(`Hotel with ID ${editingHotelId} updated.`);
      // alert(`Hotel with ID ${editingHotelId} updated.`);
      setHotels(updatedHotels);
      setEditingHotelId(null);
      setEditedHotel(null);
      // Optionally, refetch hotels or update the local state
      fetchHotels();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setHotels(hotels);
      setEditingHotelId(null);
      setEditedHotel(null);
    } finally {
      setLoadingHotelIds((prev) => prev.filter((id) => id !== editingHotelId)); // Remove hotel ID from loading list
    }
  };

  const handleCancelClick = () => {
    setEditingHotelId(null);
    setEditedHotel(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedHotel((prev) => ({ ...prev, [name]: value }));
  };

  // Display loading indicator if data is being fetched
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Display error message if an error occurs
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Check if a hotel ID is currently loading
  const isHotelLoading = (hotelId) => loadingHotelIds.includes(hotelId);

  const isURL = (str) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol (optional)
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + // port and path (optional)
      "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // query string (optional)
      "(\\#[-a-zA-Z\\d_]*)?$", // fragment locator (optional)
      "i"
    );

    return !!pattern.test(str);
  };

  // Compute counts
  const totalData = hotels.length;
  const verifiedData = hotels.filter((hotel) => hotel.verified).length;
  const validData = hotels.filter((hotel) => hotel.valid).length;

  return (
    <div className="hotel-list-container">
      <h1>Hotel List</h1>

      {/* Search and Date Filter */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by Mobile Number"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="Filter by Date"
          className="date-picker"
        />

        <label>
          <input
            type="checkbox"
            checked={showVerifiedOnly}
            onChange={handleCheckboxChange}
          />
          include Verified
        </label>

        <div className="stats">
          <span>Total Data: {totalData}</span>
          <span className="approved-count">Verified Data: {verifiedData}</span>
          <span className="approved-count">Valid Data: {validData}</span>
        </div>
      </div>

      <div className="table-container">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>DataEntry Number</th>
              <th>Video Entry</th>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Rating</th>
              <th>Phone</th>
              <th>Map Location</th>
              <th>Vlog Video</th>
              <th>Thumbnail</th>
              <th>View Count</th>
              <th>Post Date</th>
              <th>Category</th>
              <th>Approve</th>
              <th>Reject</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.hotelId}>
                <td>{hotel.userMobileNumber}</td>
                <td>{hotel?.duplicateVideoData ? hotel?.duplicateVideoData.toString(): 'false'}</td>
                <td onClick={() => {
                  if (editingHotelId != hotel.hotelId && !hotel?.duplicateVideoData) {
                    handleHotelSelect(hotel);
                  }
                }}>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelName"
                      value={editedHotel.hotelName}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel?.duplicateVideoData ? hotel?.hotel?.hotelName : hotel.hotelName
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelAddress"
                      value={editedHotel.hotelAddress}
                      onChange={handleInputChange}
                    />
                  )
                  : (
                    hotel?.duplicateVideoData ? hotel?.hotel?.hotelAddress : hotel.hotelAddress
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelCity"
                      value={editedHotel.hotelCity}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel?.duplicateVideoData ? hotel?.hotel?.hotelCity : hotel.hotelCity
                  )}
                </td>
                <td className="td-rating-Cell">
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="number"
                      name="hotelRating"
                      value={editedHotel.hotelRating}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel?.duplicateVideoData ? hotel?.hotel?.hotelRating : hotel.hotelRating
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelPhone"
                      value={editedHotel.hotelPhone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel?.duplicateVideoData ? hotel?.hotel?.hotelPhone : hotel.hotelPhone
                  )}
                </td>
                <td className="mapLink-Cell">
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelMapLocationLink"
                      value={editedHotel.hotelMapLocationLink}
                      onChange={handleInputChange}
                    />
                  ) : isURL(hotel?.duplicateVideoData ? hotel?.hotel?.hotelMapLocationLink : hotel.hotelMapLocationLink?.trim()) ? (
                    <a
                      href={hotel?.duplicateVideoData ? hotel?.hotel?.hotelMapLocationLink : hotel.hotelMapLocationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Map
                    </a>
                  ) : (
                    hotel.hotelMapLocationLink
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelVlogVideoLink"
                      value={editedHotel.hotelVlogVideoLink}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <a
                      href={hotel.hotelVlogVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch Video
                    </a>
                  )}
                </td>
                <td>
                  {hotel.videoId || hotel.videoid ? (
                    hotel?.videoType?.includes('Youtube') || hotel?.videotype?.includes('Youtube') ? (
                      <img
                        src={`https://img.youtube.com/vi/${hotel.videoId ? hotel.videoId : hotel?.videoid}/maxresdefault.jpg`}
                        alt="YouTube Thumbnail"
                        className="thumbnail"
                        onError={(e) => {
                          // Fallback to a lower resolution if maxresdefault.jpg is not available
                          e.target.onerror = null; 
                          e.target.src = `https://img.youtube.com/vi/${hotel.videoId ? hotel.videoId : hotel?.videoid}/hqdefault.jpg`;
                        }}
                      />
                    ) : (
                      "Instagram Video"
                    )
                  ) : (
                    "No Video"
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="number"
                      name="vlogVideoViewCount"
                      value={editedHotel.vlogVideoViewCount}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel.vlogVideoViewCount
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="date"
                      name="vlogPostDate"
                      value={editedHotel.vlogPostDate.substring(0, 10)}
                      onChange={handleInputChange}
                    />
                  ) : (
                    format(new Date(hotel.vlogPostDate), 'MMM do, yyyy')
                  )}
                </td>
                <td>
                {editingHotelId === hotel.hotelId ? (
                    <select
                      name="hotelCategory"
                      value={editedHotel.hotelCategory}
                      onChange={handleInputChange}
                    >
                      {category.map((cat) => (
                        <option key={cat.ID} value={cat.ID}>
                          {cat.Name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    hotel?.duplicateVideoData ? hotel?.hotel?.hotelCategory : hotel.hotelCategory
                  )}
                </td>
                <td>
                  {!hotel.verified && (
                    <button
                      className="approve-button"
                      onClick={() => handleApprove(hotel.hotelId, true, hotel?.duplicateVideoData)}
                      disabled={isHotelLoading(hotel.hotelId)}
                    >
                      {isHotelLoading(hotel.hotelId) ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                </td>
                <td>
                  {!hotel.verified && (
                    <button
                      className="reject-button"
                      onClick={() => handleApprove(hotel.hotelId, false, hotel?.duplicateVideoData)}
                      disabled={isHotelLoading(hotel.hotelId)}
                    >
                      {isHotelLoading(hotel.hotelId) ? 'Rejecting...' : 'Reject'}
                    </button>
                  )}
                </td>
                {!hotel?.duplicateVideoData && <td>
                  {editingHotelId === hotel.hotelId ? (
                    <>
                      <button
                        className="save-button"
                        onClick={handleSaveClick}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-button"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(hotel)}
                    >
                      Edit
                    </button>
                  )}
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for showing hotel details */}
      <HotelDetailsModal
        show={showModal}
        onClose={handleCloseModal}
        hotelDetails={selectedHotel}
      />
    </div>
  );
};

export default HotelList;