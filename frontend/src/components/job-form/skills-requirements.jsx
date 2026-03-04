"use client"

import { useState } from "react"
import { Search, X, Plus } from "lucide-react"

// Common skills by category for suggestions
const skillSuggestions = {
  ai: [
    "Python",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "OpenAI API",
    "LangChain",
    "LLMs",
    "Data Engineering",
    "Neural Networks",
  ],
  vr: [
    "Unity",
    "Unreal Engine",
    "C#",
    "C++",
    "Oculus SDK",
    "SteamVR",
    "3D Modeling",
    "Spatial Audio",
    "VR UI/UX",
    "OpenXR",
    "VRTK",
  ],
  xr: [
    "Mixed Reality",
    "HoloLens",
    "Magic Leap",
    "Scene Reconstruction",
    "Spatial Mapping",
    "Unity",
    "C#",
    "WebXR",
    "NVIDIA Omniverse",
  ],
  ar: [
    "ARKit",
    "ARCore",
    "Vuforia",
    "Unity",
    "8th Wall",
    "Snap Lens Studio",
    "Spark AR",
    "WebAR",
    "Object Tracking",
    "Geospatial API",
  ],
  Other: ["Project Management", "Customer Service", "Virtual Assistant", "Accounting", "Legal", "Consulting"],
}

const SkillsRequirements = ({ jobData, handleChange }) => {
  const [skillInput, setSkillInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  // Get suggestions based on selected category
  const getCategorySuggestions = () => {
    return skillSuggestions[jobData.subCategory] || skillSuggestions.Other
  }

  const handleSkillInputChange = (e) => {
    const input = e.target.value
    setSkillInput(input)

    if (input.trim()) {
      const filtered = getCategorySuggestions().filter((skill) => skill.toLowerCase().includes(input.toLowerCase()))
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const addSkill = (skill = skillInput.trim()) => {
    if (skill && !jobData.skills.includes(skill)) {
      handleChange("skills", [...jobData.skills, skill])
      setSkillInput("")
      setShowSuggestions(false)
    }
  }

  const removeSkill = (skillToRemove) => {
    handleChange(
      "skills",
      jobData.skills.filter((skill) => skill !== skillToRemove),
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="space-y-6">
      {/* Skills Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Skills Required <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => skillInput.trim() && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
            placeholder="Search for skills..."
          />
          <button
            type="button"
            onClick={() => addSkill()}
            disabled={!skillInput.trim()}
            className="absolute inset-y-0 right-0 px-3 flex items-center bg-[#12a1e2] hover:bg-[#0e8cd4] text-white rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
          </button>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-900 cursor-pointer"
                  onClick={() => addSkill(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">Add skills that are required for this job</p>
      </div>

      {/* Selected Skills */}
      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Selected Skills</div>
        {jobData.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {jobData.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm flex items-center group border border-slate-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-slate-400 hover:text-slate-600 group-hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm italic">No skills selected yet</div>
        )}
      </div>

      {/* Popular Skills */}
      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">
          Popular Skills in {(jobData.subCategory === 'ai' ? 'AI' : jobData.subCategory === 'vr' ? 'VR' : jobData.subCategory === 'xr' ? 'XR' : jobData.subCategory === 'ar' ? 'AR' : jobData.subCategory) || "this category"}
        </div>
        <div className="flex flex-wrap gap-2">
          {getCategorySuggestions()
            .slice(0, 10)
            .map((skill, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addSkill(skill)}
                disabled={jobData.skills.includes(skill)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${jobData.skills.includes(skill)
                  ? "bg-[#12a1e2]/20 border-[#12a1e2]/50 text-[#12a1e2] cursor-not-allowed"
                  : "bg-transparent border-slate-200 text-slate-600 hover:border-[#12a1e2] hover:text-[#12a1e2]"
                  }`}
              >
                {skill}
              </button>
            ))}
        </div>
      </div>

      {/* Skills Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mt-6">
        <h3 className="font-medium mb-2 text-slate-900">Tips for selecting skills</h3>
        <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
          <li>Be specific about the technologies and tools required</li>
          <li>Include both technical and soft skills when relevant</li>
          <li>Don't overload with too many skills - focus on the most important ones</li>
          <li>Consider including skill level requirements (beginner, intermediate, expert)</li>
        </ul>
      </div>
    </div>
  )
}

export default SkillsRequirements
