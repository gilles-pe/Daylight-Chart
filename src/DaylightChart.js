import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const DaylightChart = () => {
  const [viewType, setViewType] = useState('weekly');
  const [city1, setCity1] = useState('Hamburg');
  const [city2, setCity2] = useState('Munich');
  const [city3, setCity3] = useState('Rome');
  const [chartData, setChartData] = useState([]);
  const [solstices, setSolstices] = useState({});
  
  // City coordinates (latitude)
  const cityCoordinates = {
    // Europe
    "Amsterdam": 52.37,
    "Athens": 37.98,
    "Barcelona": 41.38,
    "Berlin": 52.52,
    "Bern": 46.95,
    "Brussels": 50.85,
    "Dublin": 53.35,
    "Frankfurt": 50.11,
    "Hamburg": 53.55,
    "Helsinki": 60.17,
    "Copenhagen": 55.68,
    "Cologne": 50.94,
    "Lisbon": 38.72,
    "London": 51.51,
    "Madrid": 40.42,
    "Milan": 45.46,
    "Munich": 48.14,
    "Oslo": 59.91,
    "Paris": 48.86,
    "Prague": 50.08,
    "Reykjavik": 64.13,
    "Rome": 41.90,
    "Stockholm": 59.33,
    "Vienna": 48.21,
    "Zurich": 47.37,
    
    // North America
    "Anchorage": 61.22,
    "Chicago": 41.88,
    "Los Angeles": 34.05,
    "Miami": 25.76,
    "New York": 40.71,
    "Toronto": 43.65,
    "Vancouver": 49.28,
    
    // Asia & Oceania
    "Bangkok": 13.75,
    "Hong Kong": 22.28,
    "Mumbai": 19.08,
    "Singapore": 1.35,
    "Sydney": -33.87,
    "Tokyo": 35.69,
    
    // Africa & South America
    "Cape Town": -33.93,
    "Cairo": 30.04,
    "Rio de Janeiro": -22.91,
    "Buenos Aires": -34.61,
    
    // Extreme latitudes
    "North Pole": 90.00,
    "Equator": 0.00,
    "South Pole": -90.00
  };
  
  // List of cities sorted for dropdown
  const cityList = Object.keys(cityCoordinates).sort();

  // Colors for the cities
  const cityColors = {
    city1: "#2E5BFF", // Blue
    city2: "#FF4757", // Red
    city3: "#00C07F"  // Green
  };
  
  // Calculate daylight hours for a specific day and latitude
  const calculateDayLength = (dayOfYear, latitude) => {
    // Convert day to radians
    const angle = 0.2163108 + 2 * Math.atan(0.9671396 * Math.tan(0.00860 * (dayOfYear - 186)));
    
    // Calculate sun declination
    const decl = Math.asin(0.39795 * Math.cos(angle));
    
    // Convert latitude to radians
    const latRad = (Math.PI / 180) * latitude;
    
    // Calculate hour angle
    const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decl));
    
    // Calculate day length in hours
    const dayLength = 24 * hourAngle / Math.PI;
    
    return dayLength;
  };

  // Convert day of year to day/month format
  const getDayMonthFromDayOfYear = (dayOfYear) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let day = dayOfYear;
    let month = 0;
    
    while (day > daysInMonth[month]) {
      day -= daysInMonth[month];
      month++;
    }
    
    return `${monthNames[month]} ${day}`;
  };

  // Format hours for display
  const formatHours = (hours) => {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    return `${hoursInt}h ${minutes}m`;
  };
  
  // Generate data for a city
  const generateCityData = (cityName) => {
    const latitude = cityCoordinates[cityName];
    if (latitude === undefined) return null;
    
    const weeklyData = [];
    const monthlyData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Calculate daily data for the year
    const dailyData = [];
    for (let day = 1; day <= 365; day++) {
      dailyData.push({
        dayOfYear: day,
        hours: calculateDayLength(day, latitude)
      });
    }
    
    // Find solstices
    let minDay = 1;
    let maxDay = 1;
    let minHours = 24;
    let maxHours = 0;
    
    dailyData.forEach(day => {
      if (day.hours < minHours) {
        minHours = day.hours;
        minDay = day.dayOfYear;
      }
      if (day.hours > maxHours) {
        maxHours = day.hours;
        maxDay = day.dayOfYear;
      }
    });
    
    // Format solstice data
    const winterSolstice = {
      dayOfYear: minDay,
      date: getDayMonthFromDayOfYear(minDay),
      hours: Number(minHours.toFixed(2)),
      formattedLength: formatHours(minHours)
    };
    
    const summerSolstice = {
      dayOfYear: maxDay,
      date: getDayMonthFromDayOfYear(maxDay),
      hours: Number(maxHours.toFixed(2)),
      formattedLength: formatHours(maxHours)
    };
    
    // Calculate weekly data
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = 1;
    
    for (let month = 0; month < 12; month++) {
      const daysThisMonth = daysInMonth[month];
      let monthSum = 0;
      
      // Create weekly data points
      [1, 8, 15, 22].forEach(day => {
        if (day <= daysThisMonth) {
          const actualDayOfYear = dayOfYear + day - 1;
          const hours = calculateDayLength(actualDayOfYear, latitude);
          
          weeklyData.push({
            date: `${monthNames[month]} ${day}`,
            dayOfYear: actualDayOfYear,
            hours: Number(hours.toFixed(2)),
            formattedLength: formatHours(hours)
          });
          
          monthSum += hours;
        }
      });
      
      // Calculate monthly average
      monthlyData.push({
        month: monthNames[month],
        label: monthNames[month],
        avgHours: Number((monthSum / 4).toFixed(2))
      });
      
      dayOfYear += daysThisMonth;
    }
    
    return {
      weeklyData,
      monthlyData,
      winterSolstice,
      summerSolstice
    };
  };
  
  // Format tooltip
  const formatTooltip = (value) => {
    return formatHours(value);
  };
  
  // Update data when cities change
  useEffect(() => {
    // Validate cities
    const validCity1 = cityCoordinates[city1] ? city1 : 'Hamburg';
    const validCity2 = cityCoordinates[city2] ? city2 : 'Munich';
    const validCity3 = cityCoordinates[city3] ? city3 : 'Rome';
    
    // Generate data for all three cities
    const city1Data = generateCityData(validCity1);
    const city2Data = generateCityData(validCity2);
    const city3Data = generateCityData(validCity3);
    
    // Save solstices
    setSolstices({
      city1: { 
        winter: city1Data.winterSolstice, 
        summer: city1Data.summerSolstice,
        name: validCity1,
        latitude: cityCoordinates[validCity1]
      },
      city2: { 
        winter: city2Data.winterSolstice, 
        summer: city2Data.summerSolstice,
        name: validCity2,
        latitude: cityCoordinates[validCity2]
      },
      city3: { 
        winter: city3Data.winterSolstice, 
        summer: city3Data.summerSolstice,
        name: validCity3,
        latitude: cityCoordinates[validCity3]
      }
    });
    
    // Combine data for the chart
    const combinedData = [];
    
    if (city1Data && city2Data && city3Data) {
      const data1 = viewType === 'weekly' ? city1Data.weeklyData : city1Data.monthlyData;
      const data2 = viewType === 'weekly' ? city2Data.weeklyData : city2Data.monthlyData;
      const data3 = viewType === 'weekly' ? city3Data.weeklyData : city3Data.monthlyData;
      
      for (let i = 0; i < data1.length; i++) {
        combinedData.push({
          date: viewType === 'weekly' ? data1[i].date : data1[i].label,
          [validCity1]: viewType === 'weekly' ? data1[i].hours : data1[i].avgHours,
          [validCity2]: viewType === 'weekly' ? data2[i].hours : data2[i].avgHours,
          [validCity3]: viewType === 'weekly' ? data3[i].hours : data3[i].avgHours
        });
      }
    }
    
    setChartData(combinedData);
  }, [city1, city2, city3, viewType]);
  
  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6">Daylight Hours Throughout the Year</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
        {/* City 1 Selection */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-300 font-medium">City 1:</label>
          <div className="relative">
            <div className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ backgroundColor: cityColors.city1 }}></div>
            <select 
              value={city1} 
              onChange={(e) => setCity1(e.target.value)}
              className="pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded w-full text-white appearance-none"
            >
              {cityList.map(city => (
                <option key={`city1-${city}`} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* City 2 Selection */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-300 font-medium">City 2:</label>
          <div className="relative">
            <div className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ backgroundColor: cityColors.city2 }}></div>
            <select 
              value={city2} 
              onChange={(e) => setCity2(e.target.value)}
              className="pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded w-full text-white appearance-none"
            >
              {cityList.map(city => (
                <option key={`city2-${city}`} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* City 3 Selection */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-300 font-medium">City 3:</label>
          <div className="relative">
            <div className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ backgroundColor: cityColors.city3 }}></div>
            <select 
              value={city3} 
              onChange={(e) => setCity3(e.target.value)}
              className="pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded w-full text-white appearance-none"
            >
              {cityList.map(city => (
                <option key={`city3-${city}`} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => setViewType('weekly')}
          className={`px-6 py-2 mr-2 rounded font-medium transition-colors ${viewType === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Weekly
        </button>
        <button 
          onClick={() => setViewType('monthly')}
          className={`px-6 py-2 rounded font-medium transition-colors ${viewType === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Monthly
        </button>
      </div>
      
      <div className="w-full h-96 bg-gray-800 p-4 rounded-lg shadow-inner mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.7)"
            />
            <YAxis 
              domain={[6, 18]} 
              tickCount={12} 
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }} 
              stroke="rgba(255,255,255,0.7)"
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{ backgroundColor: '#2d3748', borderColor: '#4a5568', color: 'white' }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ color: 'white' }} />
            <ReferenceLine y={12} stroke="rgba(255,255,255,0.5)" strokeDasharray="3 3" label={{ value: "12 Hours", fill: 'rgba(255,255,255,0.7)' }} />
            
            <Line 
              type="monotone" 
              dataKey={solstices.city1?.name || city1} 
              name={solstices.city1?.name || city1} 
              stroke={cityColors.city1} 
              strokeWidth={3}
              dot={{ stroke: cityColors.city1, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey={solstices.city2?.name || city2} 
              name={solstices.city2?.name || city2} 
              stroke={cityColors.city2}
              strokeWidth={3}
              dot={{ stroke: cityColors.city2, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey={solstices.city3?.name || city3} 
              name={solstices.city3?.name || city3} 
              stroke={cityColors.city3}
              strokeWidth={3}
              dot={{ stroke: cityColors.city3, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {solstices.city1 && solstices.city2 && solstices.city3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* City 1 Solstices */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-bold mb-2" style={{ color: cityColors.city1 }}>
              {solstices.city1.name} ({solstices.city1.latitude}°)
            </h3>
            <div className="flex justify-between">
              <div>
                <span className="text-gray-400">Winter ({solstices.city1.winter.date}):</span> 
                <span className="ml-1 font-medium">{solstices.city1.winter.formattedLength}</span>
              </div>
              <div>
                <span className="text-gray-400">Summer ({solstices.city1.summer.date}):</span> 
                <span className="ml-1 font-medium">{solstices.city1.summer.formattedLength}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Difference: {formatHours(solstices.city1.summer.hours - solstices.city1.winter.hours)}
            </div>
          </div>
          
          {/* City 2 Solstices */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-bold mb-2" style={{ color: cityColors.city2 }}>
              {solstices.city2.name} ({solstices.city2.latitude}°)
            </h3>
            <div className="flex justify-between">
              <div>
                <span className="text-gray-400">Winter ({solstices.city2.winter.date}):</span> 
                <span className="ml-1 font-medium">{solstices.city2.winter.formattedLength}</span>
              </div>
              <div>
                <span className="text-gray-400">Summer ({solstices.city2.summer.date}):</span> 
                <span className="ml-1 font-medium">{solstices.city2.summer.formattedLength}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Difference: {formatHours(solstices.city2.summer.hours - solstices.city2.winter.hours)}
            </div>
          </div>
          
          {/* City 3 Solstices */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-bold mb-2" style={{ color: cityColors.city3 }}>
              {solstices.city3.name} ({solstices.city3.latitude}°)
            </h3>
            <div className="flex justify-between">
              <div>
                <span className="text-gray-400">Winter ({solstices.city3.winter.date}):</span> 
                <span className="ml-1 font-medium">{solstices.city3.winter.formattedLength}</span>
              </div>
              <div>
                <span className="text-gray-400">Summer ({solstices.city3.summer.date}):</span> 
                <span className="ml-1 font-medium">{solstices.city3.summer.formattedLength}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Difference: {formatHours(solstices.city3.summer.hours - solstices.city3.winter.hours)}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-400 text-center">
        <p>Based on astronomical calculations. Daylight hours = time between sunrise and sunset.</p>
        <p>All times are theoretical values without accounting for topography or atmospheric effects.</p>
      </div>
    </div>
  );
};

export default DaylightChart;
