// All Indian states and union territories with their major cities/towns.
// State names match the spellings already stored on institutions (e.g.
// "Jammu and Kashmir", "Puducherry") so the search filters keep matching.
// The city lists power suggestions only — the form still accepts any city,
// so a place missing here never blocks adding an institution.
export const INDIA_LOCATIONS: Record<string, string[]> = {
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Kadapa', 'Amaravati', 'Eluru', 'Ongole', 'Vizianagaram'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Chapra', 'Bodh Gaya'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  Delhi: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Narela'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Farmagudi'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Morbi', 'Bharuch', 'Mehsana', 'Vallabh Vidyanagar', 'Patan'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Rohtak', 'Karnal', 'Sonipat', 'Kurukshetra', 'Yamunanagar', 'Sirsa', 'Bahadurgarh', 'Jhajjar', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Hamirpur', 'Kullu', 'Manali', 'Palampur', 'Una', 'Baddi', 'Bilaspur', 'Sundernagar'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur', 'Sopore', 'Katra', 'Awantipora'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Mesra'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Dharwad', 'Belagavi', 'Manipal', 'Udupi', 'Tumakuru', 'Davanagere', 'Ballari', 'Shivamogga', 'Kalaburagi', 'Surathkal', 'Mandya', 'Hassan'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad', 'Kottayam', 'Malappuram', 'Ernakulam', 'Idukki'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti', 'Agatti', 'Minicoy'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Ratlam', 'Dewas', 'Chhindwara', 'Khandwa', 'Vidisha'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Navi Mumbai', 'Kolhapur', 'Solapur', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar', 'Wardha', 'Lonavala'],
  Manipur: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Umiam'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Angul'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Phagwara', 'Rupnagar', 'Moga', 'Firozpur', 'Sangrur', 'Kapurthala'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar', 'Pilani', 'Jhunjhunu', 'Bharatpur', 'Sri Ganganagar', 'Chittorgarh', 'Banasthali'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur', 'Tiruppur', 'Kanchipuram', 'Kattankulathur', 'Chengalpattu', 'Hosur', 'Nagercoil', 'Karur', 'Dindigul', 'Kumbakonam', 'Sivakasi'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Secunderabad', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet', 'Sangareddy'],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Prayagraj', 'Agra', 'Noida', 'Greater Noida', 'Ghaziabad', 'Meerut', 'Aligarh', 'Bareilly', 'Gorakhpur', 'Moradabad', 'Jhansi', 'Mathura', 'Saharanpur', 'Firozabad', 'Muzaffarnagar', 'Ayodhya', 'Sultanpur'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Rudrapur', 'Kashipur', 'Pantnagar', 'Almora', 'Mussoorie'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Kalyani', 'Bardhaman', 'Santiniketan', 'Darjeeling', 'Malda', 'Haldia', 'Barrackpore', 'Jalpaiguri', 'Cooch Behar', 'Shibpur'],
};

export const INDIA_STATES = Object.keys(INDIA_LOCATIONS).sort((a, b) => a.localeCompare(b));

export function citiesForState(state: string): string[] {
  return [...(INDIA_LOCATIONS[state] ?? [])].sort((a, b) => a.localeCompare(b));
}
