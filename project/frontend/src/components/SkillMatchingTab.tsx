import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Award } from 'lucide-react';
import { User, SkillFilter, SkillSubmission } from '../types';

interface SkillMatchingTabProps {
  user: User;
}

export default function SkillMatchingTab({ user }: SkillMatchingTabProps) {
  const [filters, setFilters] = useState<SkillFilter>({});
  const [filteredSkills, setFilteredSkills] = useState<SkillSubmission[]>([]);
  const [allSkills, setAllSkills] = useState<SkillSubmission[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockSkills: SkillSubmission[] = [
      {
        id: '1',
        user_id: user.id,
        skill_name: 'React Development',
        sub_skills: [
          { name: 'React Hooks', proficiency: 4, experience: 2.5, hasCertification: true },
          { name: 'Redux', proficiency: 3, experience: 1.8, hasCertification: false },
        ],
        status: 'approved',
        submitted_at: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        user_id: user.id,
        skill_name: 'Node.js',
        sub_skills: [
          { name: 'Express.js', proficiency: 4, experience: 3.0, hasCertification: true },
          { name: 'MongoDB', proficiency: 3, experience: 2.2, hasCertification: false },
        ],
        status: 'approved',
        submitted_at: '2024-01-20T14:30:00Z',
      },
      {
        id: '3',
        user_id: user.id,
        skill_name: 'Python',
        sub_skills: [
          { name: 'Django', proficiency: 5, experience: 4.0, hasCertification: true },
          { name: 'FastAPI', proficiency: 3, experience: 1.5, hasCertification: false },
        ],
        status: 'approved',
        submitted_at: '2024-01-25T09:15:00Z',
      },
    ];
    setAllSkills(mockSkills);
    setFilteredSkills(mockSkills);
  }, [user.id]);

  useEffect(() => {
    let filtered = allSkills;

    if (filters.skill) {
      filtered = filtered.filter(skill => 
        skill.skill_name.toLowerCase().includes(filters.skill!.toLowerCase()) ||
        skill.sub_skills.some(sub => sub.name.toLowerCase().includes(filters.skill!.toLowerCase()))
      );
    }

    if (filters.proficiency) {
      filtered = filtered.filter(skill =>
        skill.sub_skills.some(sub => sub.proficiency >= filters.proficiency!)
      );
    }

    if (filters.experience) {
      filtered = filtered.filter(skill =>
        skill.sub_skills.some(sub => sub.experience >= filters.experience!)
      );
    }

    if (filters.hasCertification !== undefined) {
      filtered = filtered.filter(skill =>
        skill.sub_skills.some(sub => sub.hasCertification === filters.hasCertification)
      );
    }

    setFilteredSkills(filtered);
  }, [filters, allSkills]);

  const renderStars = (proficiency: number) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < proficiency ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Skill Matching</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filter Skills</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill/Sub-skill
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={filters.skill || ''}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                placeholder="Search skills..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Proficiency
            </label>
            <select
              value={filters.proficiency || ''}
              onChange={(e) => setFilters({ ...filters, proficiency: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="1">1 Star & Above</option>
              <option value="2">2 Stars & Above</option>
              <option value="3">3 Stars & Above</option>
              <option value="4">4 Stars & Above</option>
              <option value="5">5 Stars Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Experience (years)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={filters.experience || ''}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications
            </label>
            <select
              value={filters.hasCertification === undefined ? '' : filters.hasCertification.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                hasCertification: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Skills</option>
              <option value="true">With Certification</option>
              <option value="false">Without Certification</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setFilters({})}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Filtered Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Matching Skills ({filteredSkills.length} found)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSkills.map((skill) => 
                skill.sub_skills.map((subSkill, subIndex) => (
                  <tr key={`${skill.id}-${subIndex}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{skill.skill_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{subSkill.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(subSkill.proficiency)}
                        <span className="ml-2 text-sm text-gray-600">({subSkill.proficiency}/5)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{subSkill.experience} years</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subSkill.hasCertification ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}