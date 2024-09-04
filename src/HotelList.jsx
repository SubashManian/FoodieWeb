// src/HotelList.js
import React, { useState, useEffect } from 'react';
import './HotelList.css'; // Import the CSS file for styling
import HotelDetailsModal from './HotelDetailsModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const baseUrl = 'https://food-app-be-sequelize.onrender.com';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [countsDetails, setCountDetails] = useState({});
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch hotels data from the API
    const fetchHotels = async () => {
        try {
            setLoading(true); // Start loading
            const response = await fetch(`${baseUrl}/gethotels`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setHotels(data);
            setFilteredHotels(data); // Set filtered hotels initially to all hotels
            setError(null); // Clear any previous errors
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

  // Fetch count data from the API
    const fetchCount = async (userMobileNumber) => {
        try {
            setLoading(true); // Start loading
            let url = userMobileNumber === '' ? `${baseUrl}/count` : `${baseUrl}/count/${userMobileNumber}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setCountDetails(data);
            setError(null); // Clear any previous errors
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        fetchCount('');
        fetchHotels();
    }, []);

    // Handle search input change
    // Handle search input change
    const handleSearchChange = (event) => {
        const searchValue = event.target.value;
        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {
            // If search term is cleared, fetch hotels from API
            fetchCount('');
            fetchHotels();
        } else {
            if (searchValue?.trim()?.length === 10) {
                fetchCount(searchValue?.trim());
            }
            // Filter hotels based on the search term and selected date
            filterHotels(searchValue, selectedDate);
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date === null) {
            fetchHotels();
        } else {
            // Filter hotels based on the search term and selected date
            filterHotels(searchTerm, date);
        }
    };

    // Function to filter hotels by userMobileNumber and vlogPostDate
    const filterHotels = (searchValue, date) => {
        const filtered = hotels.filter((hotel) => {
            const matchesSearch = hotel.userMobileNumber.includes(searchValue);
            const matchesDate = date ? new Date(hotel.createdDate).toDateString() === date.toDateString() : true;
            
            return matchesSearch && matchesDate;
        });

        setHotels(filtered);
    };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
  };

  const handleHotelSelect = (hotel) => {
    // Mock fetching details for selected hotel
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const handleApprove = (hotelId) => {
    // Approve logic can go here
    console.log(`Hotel with ID ${hotelId} approved.`);
    alert(`Hotel with ID ${hotelId} approved.`);
  };

  const handleReject = (hotelId) => {
    // Approve logic can go here
    console.log(`Hotel with ID ${hotelId} approved.`);
    alert(`Hotel with ID ${hotelId} approved.`);
  };

  // Display loading indicator if data is being fetched
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Display error message if an error occurs
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

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
}

  // Compute counts
  const totalData = hotels.length;
  const verifiedData = hotels.filter(hotel => hotel.verified).length;
  const validData = hotels.filter(hotel => hotel.valid).length;

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
        <div className="stats">
            <span>Total Data: {totalData}</span>
            <span className='approved-count'>Verified Data: {verifiedData}</span>
            <span className='approved-count'>Valid Data: {validData}</span>
        </div>
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>DataEntry Number</th>
            <th>Name</th>
            <th>Address</th>
            <th>City</th>
            <th>Rating</th>
            <th>Phone</th>
            <th>Map Location</th>
            <th>Vlog Video</th>
            <th>View Count</th>
            <th>Post Date</th>
            <th>Approve</th>
            <th>Reject</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel.hotelId}>
                <td>{hotel.userMobileNumber}</td>
              <td onClick={() => {handleHotelSelect(hotel)}}>{hotel.hotelName}</td>
              <td>{hotel.hotelAddress}</td>
              <td>{hotel.hotelCity}</td>
              <td>{hotel.hotelRating}</td>
              <td>{hotel.hotelPhone}</td>
              <td>
                {isURL(hotel.hotelMapLocationLink?.trim()) 
                    ? <a href={hotel.hotelMapLocationLink} target="_blank" rel="noopener noreferrer">View on Map</a>
                    : hotel.hotelMapLocationLink
                }
              </td>
              <td>
                <a href={hotel.hotelVlogVideoLink} target="_blank" rel="noopener noreferrer">Watch Video</a>
              </td>
              <td>{hotel.vlogVideoViewCount}</td>
              <td>{hotel.vlogPostDate}</td>
                <td>
                    {!hotel.verified && <button className="approve-button" onClick={() => handleApprove(hotel.hotelId)}>Approve</button>}
                </td>
                <td>
                    {!hotel.verified && <button className="reject-button" onClick={() => handleReject(hotel.hotelId)}>Reject</button>}
                </td>
            </tr>
          ))}
        </tbody>
      </table>

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