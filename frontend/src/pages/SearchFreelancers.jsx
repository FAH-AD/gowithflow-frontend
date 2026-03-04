"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Briefcase,
  DollarSign,
  Star,
  Clock,
  Loader,
  AlertTriangle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"

const SearchFreelancers = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.Auth?.user)

  // Parse query params from URL
  const queryParams = new URLSearchParams(location.search)
  const initialSkills = queryParams.get("skills") || ""
  const initialMinRate = queryParams.get("minRate") || ""
  const initialMaxRate = queryParams.get("maxRate") || ""
  const initialAvailability = queryParams.get("availability") || ""
  const initialPage = Number.parseInt(queryParams.get("page") || "1", 10)

  // Search state
  const [searchParams, setSearchParams] = useState({
    skills: initialSkills,
    minRate: initialMinRate,
    maxRate: initialMaxRate,
    availability: initialAvailability,
    page: initialPage,
    limit: 10,
  })

  // UI state
  const [freelancers, setFreelancers] = useState([])
  const [totalFreelancers, setTotalFreelancers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch freelancers on mount and when search params change
  useEffect(() => {
    if (user) {
      fetchFreelancers()
    } else {
      navigate("/login", { state: { from: "client/search-freelancers", message: "Please login to search freelancers" } })
    }
  }, [searchParams.page, user, navigate])

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchParams.skills) params.set("skills", searchParams.skills)
    if (searchParams.minRate) params.set("minRate", searchParams.minRate)
    if (searchParams.maxRate) params.set("maxRate", searchParams.maxRate)
    if (searchParams.availability) params.set("availability", searchParams.availability)
    if (searchParams.page > 1) params.set("page", searchParams.page.toString())

    navigate(`/client/search-freelancers?${params.toString()}`, { replace: true })
  }, [searchParams, navigate])

  // Fetch freelancers from API
  const fetchFreelancers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query string
      const params = new URLSearchParams()
      if (searchParams.skills) params.set("skills", searchParams.skills)
      if (searchParams.minRate) params.set("minRate", searchParams.minRate)
      if (searchParams.maxRate) params.set("maxRate", searchParams.maxRate)
      if (searchParams.availability) params.set("availability", searchParams.availability)
      params.set("page", searchParams.page.toString())
      params.set("limit", searchParams.limit.toString())

      const response = await fetch(`http://localhost:5000/api/freelancer/search?${params.toString()}`, {
        method: "GET",

      })

      if (!response.ok) {
        throw new Error("Failed to fetch freelancers")
      }

      const data = await response.json()
      console.log(data, "freelancers data")
      setFreelancers(data.data.freelancers || [])
      setTotalFreelancers(data.data.totalFreelancers || 0)
      setTotalPages(data.data.totalPages || 1)
    } catch (err) {
      setError(err.message || "Failed to load freelancers")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams((prev) => ({ ...prev, page: 1 })) // Reset to page 1
    fetchFreelancers()
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setSearchParams((prev) => ({ ...prev, page: newPage }))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({
      skills: "",
      minRate: "",
      maxRate: "",
      availability: "",
      page: 1,
      limit: 10,
    })
  }

  // Format availability
  const formatAvailability = (availability) => {
    switch (availability) {
      case "full-time":
        return "Full Time"
      case "part-time":
        return "Part Time"
      case "contract":
        return "Contract"
      default:
        return availability
    }
  }

  // Handle hire button click
  const handleHire = (freelancerId, e) => {
    e.stopPropagation()
    navigate(`/post-job?freelancer=${freelancerId}`)
  }

  // Handle message button click
  const handleMessage = (freelancerId, e) => {
    e.stopPropagation()
    navigate(`/messages?user=${freelancerId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r mb-4 h-[200px] from-[#12a1e2]/20 to-slate-50 border-slate-200 flex items-center">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">Find Freelancers</h1>
          <p className="text-slate-500">Discover talented professionals for your projects</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg border border-slate-200 mb-6">
          <div className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="skills"
                    value={searchParams.skills}
                    onChange={handleInputChange}
                    placeholder="Skills (e.g. React, Node.js)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={18} className="text-slate-500" />
                  </div>
                  <select
                    name="availability"
                    value={searchParams.availability}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent appearance-none"
                  >
                    <option value="">All Availability</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#12a1e2] hover:bg-[#0e8cd4] text-white rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Search size={18} />
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md transition-colors flex items-center justify-center"
                  >
                    <Filter size={18} />
                    {showFilters ? (
                      <ChevronUp size={18} className="ml-1" />
                    ) : (
                      <ChevronDown size={18} className="ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-4 border-[#12a1e2]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Hourly Rate Range (PKR)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              name="minRate"
                              value={searchParams.minRate}
                              onChange={handleInputChange}
                              placeholder="Min"
                              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                            />
                            <input
                              type="number"
                              name="maxRate"
                              value={searchParams.maxRate}
                              onChange={handleInputChange}
                              placeholder="Max"
                              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="flex items-center gap-1 text-sm px-3 py-1 text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                          <span>Clear Filters</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-md flex items-center">
            <AlertTriangle size={20} className="text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-slate-500">
            {isLoading ? "Searching..." : `Found ${totalFreelancers} freelancer${totalFreelancers !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <Loader size={36} className="text-[#12a1e2] animate-spin" />
              <p className="mt-4 text-slate-500">Searching for freelancers...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && freelancers.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-[#1e1e2d] rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={24} className="text-[#12a1e2]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No freelancers found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search filters or search for something else</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Freelancer Results */}
        {!isLoading && freelancers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer) => (
              <motion.div
                key={freelancer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-[#12a1e2]/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/freelancer/profile/${freelancer._id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border border-[#2d2d3a]">
                      <img
                        src={freelancer.profilePic || "https://res.cloudinary.com/dxmeatsae/image/upload/v1745772539/client_verification_docs/mhpbkpi3vnkejxe0kpai.png"}
                        alt={freelancer.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://res.cloudinary.com/dxmeatsae/image/upload/v1745772539/client_verification_docs/mhpbkpi3vnkejxe0kpai.png"
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{freelancer.name}</h3>
                      <p className="text-[#12a1e2]">{freelancer.title || "Freelancer"}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {freelancer.skills && freelancer.skills.length > 0 ? (
                      freelancer.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">No skills listed</span>
                    )}
                    {freelancer.skills && freelancer.skills.length > 4 && (
                      <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-xs">
                        +{freelancer.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    {freelancer.hourlyRate && (
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-[#12a1e2] mr-1" />
                        <span>PKR {freelancer.hourlyRate.toLocaleString()}/hr</span>
                      </div>
                    )}
                    {freelancer.availability && (
                      <div className="flex items-center">
                        <Clock size={16} className="text-[#12a1e2] mr-1" />
                        <span>{formatAvailability(freelancer.availability)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-500 mr-1" />
                      <span>{freelancer.successRate || 0}% Success</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Briefcase size={14} className="mr-1" />
                      <span>{freelancer.completedJobs || 0} Jobs</span>
                    </div>
                  </div>

                  {user.role === "client" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => handleHire(freelancer._id, e)}
                        className="flex-1 py-2 bg-[#12a1e2] hover:bg-[#0e8cd4] text-white rounded-md transition-colors text-sm"
                      >
                        Hire
                      </button>
                      <button
                        onClick={(e) => handleMessage(freelancer._id, e)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md transition-colors text-sm"
                      >
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(searchParams.page - 1)}
                disabled={searchParams.page === 1}
                className={`px-3 py-2 rounded-md ${searchParams.page === 1
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-md ${searchParams.page === page
                    ? "bg-[#9333EA] text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(searchParams.page + 1)}
                disabled={searchParams.page === totalPages}
                className={`px-3 py-2 rounded-md ${searchParams.page === totalPages
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFreelancers
