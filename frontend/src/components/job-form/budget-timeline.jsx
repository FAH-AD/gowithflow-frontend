"use client"

import { useState } from "react"
import { Calendar, Clock, DollarSign, Trash2, Plus, Users } from "lucide-react"

const BudgetTimeline = ({ jobData, handleChange }) => {
  const [showCrowdsourcingRoles, setShowCrowdsourcingRoles] = useState(jobData.isCrowdsourced)

  const handleCrowdsourcingToggle = (e) => {
    const isEnabled = e.target.checked
    handleChange("isCrowdsourced", isEnabled)
    setShowCrowdsourcingRoles(isEnabled)

    // Initialize crowdsourcing roles array if it doesn't exist
    if (isEnabled && (!jobData.crowdsourcingRoles || jobData.crowdsourcingRoles.length === 0)) {
      handleChange("crowdsourcingRoles", [{ title: "", description: "", skills: [], budget: 0, status: "open" }])
    }
  }

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...jobData.crowdsourcingRoles]
    updatedRoles[index] = {
      ...updatedRoles[index],
      [field]: value,
    }
    handleChange("crowdsourcingRoles", updatedRoles)
  }

  const handleRoleSkillChange = (index, skills) => {
    const updatedRoles = [...jobData.crowdsourcingRoles]
    updatedRoles[index] = {
      ...updatedRoles[index],
      skills: skills,
    }
    handleChange("crowdsourcingRoles", updatedRoles)
  }

  const addNewRole = () => {
    const updatedRoles = [
      ...(jobData.crowdsourcingRoles || []),
      { title: "", description: "", skills: [], budget: 0, status: "open" },
    ]
    handleChange("crowdsourcingRoles", updatedRoles)
  }

  const removeRole = (index) => {
    const updatedRoles = jobData.crowdsourcingRoles.filter((_, i) => i !== index)
    handleChange("crowdsourcingRoles", updatedRoles)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Budget (PKR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="mr-2 text-[13px]">PKR</span>
            </div>
            <input
              type="number"
              value={jobData.budget}
              onChange={(e) => handleChange("budget", Number.parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
              placeholder="Enter your budget"
              min="5"
              required
            />
          </div>
          <p className="text-xs text-slate-500">Minimum budget is $5</p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Project Duration <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock size={18} className="text-slate-400" />
            </div>
            <select
              value={jobData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent appearance-none"
              required
            >
              <option value="less-than-1-month">Less than 1 month</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="more-than-6-months">More than 6 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Deadline <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={18} className="text-slate-400" />
          </div>
          <input
            type="date"
            value={jobData.deadline}
            onChange={(e) => handleChange("deadline", e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Experience Level <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className={`border ${jobData.experienceLevel === "entry" ? "border-[#12a1e2] bg-[#12a1e2]/10" : "border-slate-200 bg-white"
              } rounded-md p-4 cursor-pointer transition-colors`}
            onClick={() => handleChange("experienceLevel", "entry")}
          >
            <div className="font-medium text-slate-900">Entry Level</div>
            <div className="text-sm text-slate-500">Simple tasks, beginner</div>
          </div>
          <div
            className={`border ${jobData.experienceLevel === "intermediate"
                ? "border-[#12a1e2] bg-[#12a1e2]/10"
                : "border-slate-200 bg-white"
              } rounded-md p-4 cursor-pointer transition-colors`}
            onClick={() => handleChange("experienceLevel", "intermediate")}
          >
            <div className="font-medium text-slate-900">Intermediate</div>
            <div className="text-sm text-slate-500">Average complexity</div>
          </div>
          <div
            className={`border ${jobData.experienceLevel === "expert"
                ? "border-[#12a1e2] bg-[#12a1e2]/10"
                : "border-slate-200 bg-white"
              } rounded-md p-4 cursor-pointer transition-colors`}
            onClick={() => handleChange("experienceLevel", "expert")}
          >
            <div className="font-medium text-slate-900">Expert</div>
            <div className="text-sm text-slate-500">Complex tasks, specialist</div>
          </div>
        </div>
      </div>

      {/* Crowdsourcing Option */}
      <div className="border border-slate-200 rounded-md p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users size={20} className="text-[#12a1e2] mr-2" />
            <div>
              <h3 className="font-medium text-slate-900">Team Crowdsourcing</h3>
              <p className="text-sm text-slate-500">Hire multiple freelancers for different roles</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={jobData.isCrowdsourced}
              onChange={handleCrowdsourcingToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#12a1e2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12a1e2]"></div>
          </label>
        </div>

        {showCrowdsourcingRoles && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-slate-900">Define Team Roles</h4>
              <button
                type="button"
                onClick={addNewRole}
                className="flex items-center text-sm text-[#12a1e2] hover:text-[#0e8cd4] transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Role
              </button>
            </div>

            {jobData.crowdsourcingRoles &&
              jobData.crowdsourcingRoles.map((role, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-md bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-slate-900">Role No.{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeRole(index)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Role Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={role.title}
                        onChange={(e) => handleRoleChange(index, "title", e.target.value)}
                        className="bg-white border border-slate-200 text-slate-900 rounded-md block w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                        placeholder="e.g. Frontend Developer"
                        required={jobData.isCrowdsourced}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Role Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={role.description}
                        onChange={(e) => handleRoleChange(index, "description", e.target.value)}
                        className="bg-white border border-slate-200 text-slate-900 rounded-md block w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                        placeholder="Describe the responsibilities for this role"
                        rows="2"
                        required={jobData.isCrowdsourced}
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Required Skills <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {role.skills.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm flex items-center border border-slate-300"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedSkills = role.skills.filter((_, i) => i !== skillIndex)
                                handleRoleSkillChange(index, updatedSkills)
                              }}
                              className="ml-2 text-slate-500 hover:text-red-500"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Add a skill"
                          className="bg-white border border-slate-200 text-slate-900 rounded-l-md block w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              e.preventDefault()
                              const updatedSkills = [...role.skills, e.target.value.trim()]
                              handleRoleSkillChange(index, updatedSkills)
                              e.target.value = ""
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.previousSibling
                            if (input.value.trim()) {
                              const updatedSkills = [...role.skills, input.value.trim()]
                              handleRoleSkillChange(index, updatedSkills)
                              input.value = ""
                            }
                          }}
                          className="bg-[#12a1e2] hover:bg-[#0e8cd4] text-white px-3 py-2 rounded-r-md transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Budget for this role (PKR) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-[13px] text-green-600">PKR</span>
                        </div>
                        <input
                          type="number"
                          value={role.budget}
                          onChange={(e) => handleRoleChange(index, "budget", Number.parseFloat(e.target.value))}
                          className="bg-white border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                          placeholder="Budget for this role"
                          min="5"
                          required={jobData.isCrowdsourced}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetTimeline
