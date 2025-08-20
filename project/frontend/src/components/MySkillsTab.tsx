// import { useState, useEffect } from 'react';
// import { Plus, Award, FileText, Star } from 'lucide-react';
// import AddSkillCard from './AddSkillCard';
// import { User, SkillSubmission } from '../types';

// interface MySkillsTabProps {
//   user: User;
// }

// export default function MySkillsTab({ user }: MySkillsTabProps) {
//   const [showAddSkill, setShowAddSkill] = useState(false);
//   const [skills, setSkills] = useState<SkillSubmission[]>([]);

//   // Mock data for demonstration
//   useEffect(() => {
//     setSkills([
//       {
//         id: 1,
//         user_id: user.id,
//         skill_name: 'React Development',
//         sub_skills: [
//           { name: 'React Hooks', proficiency: 4, experience: 2.5, hasCertification: true },
//           { name: 'Redux', proficiency: 3, experience: 1.8, hasCertification: false },
//         ],
//         status: 'approved',
//         submitted_at: '2024-01-15T10:00:00Z',
//       },
//       {
//         id: 2,
//         user_id: user.id,
//         skill_name: 'Node.js',
//         sub_skills: [
//           { name: 'Express.js', proficiency: 4, experience: 3.0, hasCertification: true },
//           { name: 'MongoDB', proficiency: 3, experience: 2.2, hasCertification: false },
//         ],
//         status: 'pending',
//         submitted_at: '2024-01-20T14:30:00Z',
//       },
//     ]);
//   }, [user.id]);

//   const handleAddSkill = (skillData: any) => {
//     const newSkill: SkillSubmission = {
//       id: Date.now(),
//       user_id: user.id,
//       skill_name: skillData.skillName,
//       sub_skills: skillData.subSkills,
//       status: 'pending',
//       submitted_at: new Date().toISOString(),
//     };
//     setSkills([...skills, newSkill]);
//     setShowAddSkill(false);
//   };

//   const getStatusBadge = (status: string) => {
//     const styles = {
//       pending: 'bg-yellow-100 text-yellow-800',
//       approved: 'bg-green-100 text-green-800',
//       rejected: 'bg-red-100 text-red-800',
//     };
    
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const renderStars = (proficiency: number) => {
//     return (
//       <div className="flex space-x-1">
//         {[...Array(5)].map((_, i) => (
//           <Star
//             key={i}
//             className={`w-4 h-4 ${i < proficiency ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
//           />
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>
//         <button
//           onClick={() => setShowAddSkill(true)}
//           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-5 h-5 mr-2" />
//           Add Skill
//         </button>
//       </div>

//       {showAddSkill && (
//         <AddSkillCard
//           onSubmit={handleAddSkill}
//           onCancel={() => setShowAddSkill(false)}
//         />
//       )}

//       {/* Skills Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-medium text-gray-900">Your Skills Portfolio</h3>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Skill Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Sub-skills
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Proficiency
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Experience
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Certifications
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {skills.map((skill) => (
//                 <tr key={skill.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <Award className="w-5 h-5 text-blue-600 mr-2" />
//                       <span className="font-medium text-gray-900">{skill.skill_name}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="space-y-2">
//                       {skill.sub_skills.map((subSkill, index) => (
//                         <div key={index} className="text-sm text-gray-700">
//                           {subSkill.name}
//                         </div>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="space-y-2">
//                       {skill.sub_skills.map((subSkill, index) => (
//                         <div key={index} className="flex items-center">
//                           {renderStars(subSkill.proficiency)}
//                           <span className="ml-2 text-sm text-gray-600">({subSkill.proficiency}/5)</span>
//                         </div>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="space-y-2">
//                       {skill.sub_skills.map((subSkill, index) => (
//                         <div key={index} className="text-sm text-gray-700">
//                           {subSkill.experience} years
//                         </div>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="space-y-2">
//                       {skill.sub_skills.map((subSkill, index) => (
//                         <div key={index}>
//                           {subSkill.hasCertification ? (
//                             <div className="flex items-center text-green-600">
//                               <FileText className="w-4 h-4 mr-1" />
//                               <span className="text-sm">Certified</span>
//                             </div>
//                           ) : (
//                             <span className="text-sm text-gray-500">N/A</span>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {getStatusBadge(skill.status)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { AlignCenter, Award, FileText, Star } from "lucide-react";
import { Skill } from "../types";

// Backend response types
interface SubSkillResponseFromBackend {
  id: number;
  skill_id: number;
  sub_skill_name: string;
  employee_proficiency: number;
  manager_proficiency?: number;
  experience_years: number;
  has_certification: boolean;
  certification_file_url?: string;
  status?: "pending" | "approved" | "rejected";
  manager_comments?: string;
  created_at: string;
}

interface SkillResponseFromBackend {
  id: number;
  user_id: number;
  skill_name: string;
  status: "pending" | "approved" | "rejected";
  manager_comments?: string;
  created_at: string;
  sub_skills: SubSkillResponseFromBackend[];
}

export default function MySkillsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/skills/my-skills`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data: SkillResponseFromBackend[] = await res.json();

        const mappedSkills: Skill[] = data.map((skillResp) => ({
          id: skillResp.id,
          user_id: skillResp.user_id,
          skill_name: skillResp.skill_name,
          created_at: skillResp.created_at,
          status: skillResp.status,
          manager_comments: skillResp.manager_comments,
          sub_skills: skillResp.sub_skills.map((sub) => ({
            id: sub.id,
            skill_id: sub.skill_id,
            sub_skill_name: sub.sub_skill_name,
            proficiency_level: sub.employee_proficiency,
            manager_proficiency: sub.manager_proficiency,
            status: sub.status,
            manager_comments: sub.manager_comments,
            experience_years: sub.experience_years,
            has_certification: sub.has_certification,
            certification_file_url: sub.certification_file_url,
            created_at: sub.created_at,
          })),
        }));

        setSkills(mappedSkills);
      } catch (err) {
        console.error(err);
        setError("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [BASE_URL]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderStars = (proficiency: number) => (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < proficiency ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  if (loading) return <p>Loading skills...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Your Skills Portfolio
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Skill Name</th>
                <th>Sub-skills</th>
                <th>Proficiency</th>
                <th>Experience</th>
                <th>Certification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    <Award className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">
                      {skill.skill_name}
                    </span>
                  </td>

                  <td className="px-6 py-4 space-y-1">
                    {skill.sub_skills.map((sub) => (
                      <div key={sub.id} className="text-sm text-gray-700">
                        {sub.sub_skill_name}
                      </div>
                    ))}
                  </td>

                  <td className="px-6 py-4 space-y-1">
                    {skill.sub_skills.map((sub) => (
                      <div key={sub.id} className="flex items-center space-x-2">
                        {renderStars(sub.manager_proficiency ?? sub.proficiency_level)}
                        <span className="text-sm text-gray-600">
                          ({sub.manager_proficiency ?? sub.proficiency_level}/5)
                        </span>
                      </div>
                    ))}
                  </td>

                  <td className="px-6 py-4 space-y-1">
                    {skill.sub_skills.map((sub) => (
                      <div key={sub.id} className="text-sm text-gray-700">
                        {sub.experience_years} years
                      </div>
                    ))}
                  </td>

                  <td className="px-6 py-4 space-y-1">
                    {skill.sub_skills.map((sub) => (
                      <div key={sub.id}>
                        {sub.has_certification ? (
                          <div className="flex items-center text-green-600">
                            <FileText className="w-4 h-4 mr-1" />
                            <span className="text-sm">Certified</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    ))}
                  </td>

                  <td className="px-6 py-4 flex flex-col items-center">
  {skill.sub_skills.map((sub) => (
    <div key={sub.id} className="mb-1">
      {getStatusBadge(sub.status)}
    </div>
  ))}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
