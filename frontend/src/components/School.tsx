import React, { useState } from 'react';
import { 
  School as SchoolIcon, 
  GraduationCap, 
  Award, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle, 
  Star, 
  ChevronRight,
  Search,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';

interface SchoolData {
  id: number;
  name: string;
  location: string;
  city: string;
  established: string;
  students: string;
  board: string;
  features: string[];
  phone: string;
  email: string;
  website: string;
  image: string;
  gradient: string;
  badgeColor: string;
  badgeText: string;
  icon: React.ComponentType<any>;
}

const schools: SchoolData[] = [
  // Delhi Schools
  {
    id: 1,
    name: "Delhi Public School",
    location: "Sector 12, R.K. Puram, New Delhi",
    city: "Delhi",
    established: "1972",
    students: "3,500+",
    board: "CBSE",
    features: ["Smart Classes", "Sports Complex", "Science Labs", "Library"],
    phone: "+91-11-2617-9756",
    email: "info@dpsrkp.net",
    website: "www.dpsrkp.net",
    image: "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-blue-600 to-blue-800",
    badgeColor: "bg-yellow-400 text-yellow-900",
    badgeText: "⭐ Premium",
    icon: SchoolIcon
  },
  {
    id: 2,
    name: "Modern School",
    location: "Barakhamba Road, New Delhi",
    city: "Delhi",
    established: "1920",
    students: "2,800+",
    board: "CBSE",
    features: ["Heritage Campus", "Music & Arts", "Swimming Pool", "Auditorium"],
    phone: "+91-11-2331-4109",
    email: "principal@modernschool.net",
    website: "www.modernschool.net",
    image: "https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-green-600 to-green-800",
    badgeColor: "bg-green-400 text-green-900",
    badgeText: "🏆 Elite",
    icon: GraduationCap
  },
  {
    id: 3,
    name: "St. Columba's School",
    location: "Ashok Place, New Delhi",
    city: "Delhi",
    established: "1941",
    students: "2,200+",
    board: "ICSE",
    features: ["Boys School", "Cricket Ground", "Computer Lab", "Chapel"],
    phone: "+91-11-2336-3151",
    email: "office@stcolumbas.org",
    website: "www.stcolumbas.org",
    image: "https://images.pexels.com/photos/289740/pexels-photo-289740.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-purple-600 to-purple-800",
    badgeColor: "bg-purple-400 text-purple-900",
    badgeText: "🎓 Excellence",
    icon: Award
  },
  // Pune Schools
  {
    id: 4,
    name: "Symbiosis International School",
    location: "Viman Nagar, Pune",
    city: "Pune",
    established: "2003",
    students: "2,500+",
    board: "IB & CBSE",
    features: ["International Curriculum", "Innovation Lab", "Sports Academy", "Digital Learning"],
    phone: "+91-20-2668-1194",
    email: "admissions@sis.edu.in",
    website: "www.sis.edu.in",
    image: "https://images.pexels.com/photos/8197544/pexels-photo-8197544.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-indigo-600 to-indigo-800",
    badgeColor: "bg-indigo-400 text-indigo-900",
    badgeText: "🌟 International",
    icon: SchoolIcon
  },
  {
    id: 5,
    name: "Pawar Public School",
    location: "Bhandarkar Road, Pune",
    city: "Pune",
    established: "1995",
    students: "3,200+",
    board: "CBSE",
    features: ["Robotics Lab", "Olympic Size Pool", "Performing Arts", "Green Campus"],
    phone: "+91-20-2553-9393",
    email: "info@pawarpublicschool.com",
    website: "www.pawarpublicschool.com",
    image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-teal-600 to-teal-800",
    badgeColor: "bg-teal-400 text-teal-900",
    badgeText: "🏅 Premier",
    icon: GraduationCap
  },
  // Mumbai Schools
  {
    id: 6,
    name: "Dhirubhai Ambani International School",
    location: "Bandra Kurla Complex, Mumbai",
    city: "Mumbai",
    established: "2003",
    students: "1,800+",
    board: "IB",
    features: ["World Class Faculty", "Innovation Center", "Marine Drive Campus", "Global Exchange"],
    phone: "+91-22-4097-1111",
    email: "admissions@dais.edu.in",
    website: "www.dais.edu.in",
    image: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-orange-600 to-orange-800",
    badgeColor: "bg-orange-400 text-orange-900",
    badgeText: "💎 Luxury",
    icon: Award
  },
  {
    id: 7,
    name: "Cathedral & John Connon School",
    location: "Fort, Mumbai",
    city: "Mumbai",
    established: "1860",
    students: "2,400+",
    board: "ICSE & ISC",
    features: ["Heritage Building", "Alumni Network", "Drama Theatre", "Research Center"],
    phone: "+91-22-2266-0870",
    email: "principal@cathedral-school.com",
    website: "www.cathedral-school.com",
    image: "https://images.pexels.com/photos/5212327/pexels-photo-5212327.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-red-600 to-red-800",
    badgeColor: "bg-red-400 text-red-900",
    badgeText: "🏛️ Heritage",
    icon: SchoolIcon
  },
  // Jaipur Schools
  {
    id: 8,
    name: "Mayo College",
    location: "Mayo College Road, Ajmer",
    city: "Jaipur",
    established: "1875",
    students: "1,500+",
    board: "CBSE",
    features: ["Royal Heritage", "Boarding School", "Equestrian Club", "Alumni Excellence"],
    phone: "+91-145-242-2227",
    email: "principal@mayocollege.com",
    website: "www.mayocollege.com",
    image: "https://images.pexels.com/photos/159740/library-la-trobe-study-students-159740.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-amber-600 to-amber-800",
    badgeColor: "bg-amber-400 text-amber-900",
    badgeText: "👑 Royal",
    icon: Award
  },
  {
    id: 9,
    name: "Jayshree Periwal International School",
    location: "Mahapura, Jaipur",
    city: "Jaipur",
    established: "2004",
    students: "2,800+",
    board: "IB & Cambridge",
    features: ["International Faculty", "Tech Integration", "Sustainability Focus", "Arts Academy"],
    phone: "+91-141-713-1333",
    email: "admissions@jpisjaipur.org",
    website: "www.jpisjaipur.org",
    image: "https://images.pexels.com/photos/8197463/pexels-photo-8197463.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-pink-600 to-pink-800",
    badgeColor: "bg-pink-400 text-pink-900",
    badgeText: "🌍 Global",
    icon: GraduationCap
  },
  // Nagpur Schools
  {
    id: 10,
    name: "Somalwar High School",
    location: "Khamla Square, Nagpur",
    city: "Nagpur",
    established: "1965",
    students: "4,200+",
    board: "CBSE & State Board",
    features: ["Multiple Branches", "Sports Excellence", "Cultural Programs", "Community Service"],
    phone: "+91-712-222-3456",
    email: "info@somalwarschool.org",
    website: "www.somalwarschool.org",
    image: "https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-emerald-600 to-emerald-800",
    badgeColor: "bg-emerald-400 text-emerald-900",
    badgeText: "🌱 Community",
    icon: SchoolIcon
  },
  {
    id: 11,
    name: "Centre Point School",
    location: "Wardhaman Nagar, Nagpur",
    city: "Nagpur",
    established: "1985",
    students: "3,000+",
    board: "CBSE",
    features: ["Integrated Campus", "Technology Center", "Medical Facility", "Transport Service"],
    phone: "+91-712-224-5678",
    email: "admission@centrepointschool.edu.in",
    website: "www.centrepointschool.edu.in",
    image: "https://images.pexels.com/photos/5427673/pexels-photo-5427673.jpeg?auto=compress&cs=tinysrgb&w=800",
    gradient: "from-violet-600 to-violet-800",
    badgeColor: "bg-violet-400 text-violet-900",
    badgeText: "🎯 Focus",
    icon: Award
  }
];

const School: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cities = ['All', 'Delhi', 'Pune', 'Mumbai', 'Jaipur', 'Nagpur'];

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'All' || school.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-blue-600 flex items-center gap-2 text-sm sm:text-base mr-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="logo flex items-center flex-shrink-0">
                <div className="logo-icon w-8 h-8 text-blue-600 mr-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <span className="logo-text text-xl font-bold text-gray-900">My UniOne</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search schools by name, city, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            {/* City Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search Results Info */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredSchools.length} of {schools.length} schools
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCity !== 'All' && ` in ${selectedCity}`}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Discover Premier Schools</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Explore top-rated educational institutions across India that provide excellence in academics, 
            extracurricular activities, and holistic development for your child's bright future.
          </p>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {filteredSchools.map((school) => {
            const IconComponent = school.icon;
            return (
              <div key={school.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                <div className="relative">
                  <div 
                    className={`h-48 bg-gradient-to-br ${school.gradient} flex items-center justify-center relative overflow-hidden`}
                    style={{backgroundImage: `url(${school.image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="text-center text-white relative z-10">
                      <IconComponent className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 opacity-90" />
                      <h3 className="text-lg sm:text-2xl font-bold">{school.name}</h3>
                      <p className="text-gray-100 text-sm sm:text-base">{school.city}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className={`${school.badgeColor} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold`}>
                      {school.badgeText}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600">{school.location}</span>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Established</span>
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm">{school.established}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Students</span>
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm">{school.students}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Board</span>
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm">{school.board}</span>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {school.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-xs sm:text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{school.phone}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="break-all">{school.email}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="break-all">{school.website}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                      Visit School
                    </button>
                    <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm">
                      Get Info
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <SchoolIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No schools found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or city filter.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('All');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Why Choose These Schools Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Why Choose These Premier Schools?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Academic Excellence</h3>
              <p className="text-xs sm:text-sm text-gray-600">Consistently high board results and university placements</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Experienced Faculty</h3>
              <p className="text-xs sm:text-sm text-gray-600">Qualified teachers with years of teaching experience</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SchoolIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Modern Infrastructure</h3>
              <p className="text-xs sm:text-sm text-gray-600">State-of-the-art facilities and learning environments</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Holistic Development</h3>
              <p className="text-xs sm:text-sm text-gray-600">Focus on sports, arts, and character building</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ready to Explore These Schools?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Take the next step in your child's educational journey. Schedule visits, get detailed information, 
            and make informed decisions about their future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center text-sm sm:text-base">
              Schedule School Visits
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
            <button className="border border-blue-600 text-blue-600 px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base">
              Download Brochures
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-white border-t border-gray-200 mt-12">
        <div className="footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="footer-section text-center sm:text-left">
              <div className="footer-logo flex items-center justify-center sm:justify-start mb-4">
                <div className="logo-icon w-8 h-8 text-blue-600 mr-3 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">UNIONE Schools</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Connecting families with premier educational institutions across India.</p>
            </div>
            <div className="footer-section text-center sm:text-left">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="footer-links space-y-2">
                <li><button className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Search Schools</button></li>
                <li><button className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Compare Schools</button></li>
                <li><button className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Admission Guide</button></li>
                <li><button className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">Reviews</button></li>
              </ul>
            </div>
            <div className="footer-section text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
              <div className="contact-info space-y-2">
                <div className="contact-item text-gray-600 text-sm sm:text-base">support@unione-schools.edu</div>
                <div className="contact-item text-gray-600 text-sm sm:text-base">+91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600 text-sm">&copy; 2025 UNIONE Schools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default School;