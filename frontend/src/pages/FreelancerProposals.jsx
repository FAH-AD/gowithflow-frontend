"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
} from "lucide-react"
import Navbar from "../components/Navbar"
import axios from "axios"

const FreelancerProposals = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.Auth.user)

  const [proposals, setProposals] = useState([])
  const [filteredProposals, setFilteredProposals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("newest")
  const token = localStorage.getItem("authToken")
  // Check if user is authorized (freelancer role)
  useEffect(() => {
    if (!user) {
      navigate("/login", {
        state: { from: "/member/my-proposals", message: "Please login to view your applications" },
      })
    } else {
      fetchProposals()
    }
  }, [user, navigate])

  // Fetch proposals from API
  const fetchProposals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(token, "token in proposals")
      const response = await axios.get("http://localhost:5000/api/bids/my-bids", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data, "response in proposals")
      setProposals(response.data.message.bids);
      setFilteredProposals(response.data.message.bids);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  // Filter proposals by status
  const filterProposals = (status) => {
    setActiveFilter(status)

    if (status === "all") {
      setFilteredProposals(proposals)
    } else {
      const filtered = proposals.filter((proposal) => proposal.status === status)
      setFilteredProposals(filtered)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (!query.trim()) {
      filterProposals(activeFilter)
      return
    }

    const searchResults = proposals.filter((proposal) => {
      // Filter by active status first
      if (activeFilter !== "all" && proposal.status !== activeFilter) {
        return false
      }

      // Then search by job title or client name
      const jobTitle = proposal.job?.title?.toLowerCase() || ""
      return jobTitle.includes(query.toLowerCase())
    })

    setFilteredProposals(searchResults)
  }

  // Handle sort
  const handleSort = (option) => {
    setSortOption(option)

    const sorted = [...filteredProposals]

    switch (option) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "highest":
        sorted.sort((a, b) => b.budget - a.budget)
        break
      case "lowest":
        sorted.sort((a, b) => a.budget - b.budget)
        break
      default:
        break
    }

    setFilteredProposals(sorted)
  }

  // Navigate to job details
  const viewJobDetails = (jobId) => {
    navigate(user.role === 'client' ? `/jobs/${jobId}` : `/member/jobs/${jobId}`)
  }

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-500",
          icon: <AlertCircle size={14} className="mr-1" />,
          label: "Pending",
        }
      case "accepted":
        return {
          bg: "bg-green-500/10",
          text: "text-green-500",
          icon: <CheckCircle size={14} className="mr-1" />,
          label: "Accepted",
        }
      case "rejected":
        return {
          bg: "bg-red-500/10",
          text: "text-red-500",
          icon: <XCircle size={14} className="mr-1" />,
          label: "Rejected",
        }
      // case "completed":
      //   return {
      //     bg: "bg-blue-500/10",
      //     text: "text-blue-500",
      //     icon: <CheckCircle size={14} className="mr-1" />,
      //     label: "Completed",
      //   }
      case "withdrawn":
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-500",
          icon: <XCircle size={14} className="mr-1" />,
          label: "Withdrawn",
        }
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-500",
          icon: null,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        }
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#12a1e2] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-900">Loading your applications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r mb-6 h-[200px] from-[#12a1e2]/20 to-slate-50 border-slate-200 flex items-center">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-slate-500">Track and manage all your job applications</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-md flex items-center">
            <AlertCircle size={20} className="text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white border-slate-200 mb-6">
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <button
                  onClick={() => filterProposals("all")}
                  className={`px-4 py-2 rounded-md whitespace-nowrap mr-2 ${activeFilter === "all" ? "bg-[#12a1e2] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  All Applications
                </button>
                <button
                  onClick={() => filterProposals("pending")}
                  className={`px-4 py-2 rounded-md whitespace-nowrap mr-2 ${activeFilter === "pending"
                    ? "bg-[#12a1e2] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => filterProposals("accepted")}
                  className={`px-4 py-2 rounded-md whitespace-nowrap mr-2 ${activeFilter === "accepted"
                    ? "bg-[#12a1e2] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  Accepted
                </button>


              </div>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent w-full sm:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <select
                    value={sortOption}
                    onChange={(e) => handleSort(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Budget</option>
                    <option value="lowest">Lowest Budget</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-white border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-[#1e1e2d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-[#9333EA]" />
              </div>
              <h3 className="text-xl font-bold mb-2">No applications found</h3>
              <p className="text-slate-500 mb-6">
                {activeFilter === "all"
                  ? "You haven't submitted any applications yet."
                  : `You don't have any ${activeFilter} applications.`}
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="px-4 py-2 bg-[#12a1e2] hover:bg-[#0e8cd4] text-white rounded-md transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            filteredProposals.map((proposal) => {
              const statusBadge = getStatusBadge(proposal.status)

              return (
                <div
                  key={proposal._id}
                  className="bg-white border-slate-200 overflow-hidden hover:border-[#9333EA]/50 transition-colors cursor-pointer"
                  onClick={() => viewJobDetails(proposal.job._id)}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-[#12a1e2] transition-colors">
                          {proposal.job?.title || "Untitled Job"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center">

                            PKR {proposal.budget.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {proposal.deliveryTime} {proposal.deliveryTimeUnit}
                          </span>
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            Submitted {formatDate(proposal.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center px-3 py-1 rounded-full text-sm ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {statusBadge.icon}
                          {statusBadge.label}
                        </div>
                        <ChevronRight size={20} className="text-slate-500" />
                      </div>
                    </div>

                    {/* Milestones Summary */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Job Description</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 line-clamp-2">{proposal.job?.description || "No description provided."}</p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          viewJobDetails(proposal.job._id)
                        }}
                        className="flex items-center text-[#12a1e2] hover:text-[#0e8cd4] transition-colors"
                      >
                        View Job Details
                        <ArrowUpRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default FreelancerProposals
