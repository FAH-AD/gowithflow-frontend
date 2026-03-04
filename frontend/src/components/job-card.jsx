"use client"

import { useState } from "react"
import { Bookmark, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

const JobCard = ({ job, onSave, onUnsave }) => {
  const [isSaved, setIsSaved] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-lg p-5 mb-4 border border-slate-200 hover:border-[#12a1e2]/50 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
          <div className="flex items-center mt-1 text-sm text-slate-500">
            <span className="mr-3 font-semibold text-slate-900">PKR {job.budget}</span>
            <span className="mr-3 text-slate-300">•</span>
            <span>{job.duration}</span>
            <span className="mr-3 text-slate-300">•</span>
            <span>{job.postedAt}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="bg-[#12a1e2]/10 text-[#12a1e2] px-2 py-1 rounded-md text-sm font-semibold mr-3 border border-[#12a1e2]/20">
            {job.matchScore}% Match
          </div>
          <button onClick={() => setIsSaved(!isSaved)} className="text-slate-400 hover:text-[#12a1e2] transition-colors">
            <Bookmark size={20} fill={isSaved ? "#12a1e2" : "none"} className={isSaved ? "text-[#12a1e2]" : ""} />
          </button>
        </div>
      </div>

      <p className="text-slate-600 text-sm my-3 line-clamp-2 leading-relaxed">{job.description}</p>

      <div className="flex flex-wrap gap-2 my-3">
        {job.skills.map((skill, index) => (
          <span key={index} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs border border-slate-200">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center">
          <img className="w-9 h-9 bg-[#12a1e2]/10 rounded-full flex items-center justify-center border border-[#12a1e2]/20 object-cover mr-3" src={job.client.profileImage} />

          <div>
            <p className="text-sm font-bold text-slate-900">{job.client.name}</p>
            <div className="flex items-center text-xs mt-0.5">
              <span className="text-[#12a1e2] font-semibold">{job.client.companyName}</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="text-slate-500 font-medium">PKR {job.client.totalSpent} total spent</span>

            </div>
          </div>
        </div>
        {job.hasApplied ? (
          <span className="text-green-500 font-medium text-sm">Already Applied</span>
        ) : (
          <button
            onClick={() => navigate(`/freelancer/apply-job/${job.id}`, { state: { job } })}
            className="bg-[#12a1e2] hover:bg-[#0e8cd4] text-white px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition-all active:scale-95"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  )
}

export default JobCard
