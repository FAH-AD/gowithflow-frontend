"use client"

import { FileText, Briefcase, MapPin } from "lucide-react"

const BasicDetails = ({ jobData, handleChange }) => {
    return (
        <div className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                    Job Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        id="title"
                        value={jobData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                        placeholder="e.g. Full Stack Developer for E-commerce Website"
                        maxLength={100}
                        required
                    />
                </div>
                <p className="text-xs text-slate-500">
                    Be specific and concise. Maximum 100 characters.
                    <span className="ml-1 text-slate-400">{jobData.title.length}/100</span>
                </p>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                    Job Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <FileText size={18} className="text-slate-400" />
                    </div>
                    <textarea
                        id="description"
                        value={jobData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent"
                        placeholder="Describe your project in detail..."
                        rows="8"
                        required
                    ></textarea>
                </div>
                <p className="text-xs text-slate-500">
                    Include all relevant details about your project, requirements, and expectations.
                </p>
            </div>

            {/* Sub Category */}
            <div className="space-y-2">
                <label htmlFor="subCategory" className="block text-sm font-medium text-slate-700">
                    Category
                </label>
                <select
                    id="subCategory"
                    value={jobData.subCategory}
                    onChange={(e) => handleChange("subCategory", e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-md block w-full px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#12a1e2] focus:border-transparent appearance-none"
                >
                    <option value="ai">Artificial Intelligence (AI)</option>
                    <option value="vr">Virtual Reality (VR)</option>
                    <option value="xr">Extended Reality (XR)</option>
                    <option value="ar">Augmented Realtiy (AR)</option>

                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Location Preference</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                        className={`border ${jobData.location === "remote" ? "border-[#12a1e2] bg-[#12a1e2]/10" : "border-slate-200 bg-white"
                            } rounded-md p-4 cursor-pointer transition-colors shadow-sm`}
                        onClick={() => handleChange("location", "remote")}
                    >
                        <div className="flex items-center mb-2">
                            <MapPin size={18} className="text-[#12a1e2] mr-2" />
                            <div className="font-medium text-slate-900">Remote</div>
                        </div>
                        <div className="text-sm text-slate-500">Work from anywhere</div>
                    </div>
                    <div
                        className={`border ${jobData.location === "on-site" ? "border-[#12a1e2] bg-[#12a1e2]/10" : "border-slate-200 bg-white"
                            } rounded-md p-4 cursor-pointer transition-colors shadow-sm`}
                        onClick={() => handleChange("location", "on-site")}
                    >
                        <div className="flex items-center mb-2">
                            <MapPin size={18} className="text-[#12a1e2] mr-2" />
                            <div className="font-medium text-slate-900">On-site</div>
                        </div>
                        <div className="text-sm text-slate-500">Work at your location</div>
                    </div>
                    <div
                        className={`border ${jobData.location === "hybrid" ? "border-[#12a1e2] bg-[#12a1e2]/10" : "border-slate-200 bg-white"
                            } rounded-md p-4 cursor-pointer transition-colors shadow-sm`}
                        onClick={() => handleChange("location", "hybrid")}
                    >
                        <div className="flex items-center mb-2">
                            <MapPin size={18} className="text-[#12a1e2] mr-2" />
                            <div className="font-medium text-slate-900">Hybrid</div>
                        </div>
                        <div className="text-sm text-slate-500">Mix of remote and on-site</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BasicDetails
