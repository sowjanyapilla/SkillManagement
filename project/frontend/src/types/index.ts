export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  is_manager: boolean;
  created_at: string;
}

export interface Skill {
  id: number;
  user_id: number;
  skill_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  manager_comments?: string;
  sub_skills: SubSkill[];  // always present from backend
}
export interface SubSkill {
  id: number;
  skill_id: number;
  sub_skill_name: string;
  proficiency_level: number;       // employee_proficiency
  experience_years: number;
  has_certification: boolean;
  certification_file_url?: string;
  created_at: string;

  // Add manager-reviewed properties
  manager_proficiency?: number;    // optional
  status?: "pending" | "approved" | "rejected";
  manager_comments?: string;
}

// Separate interface ONLY for when submitting new skills
export interface SkillSubmission {
  id: number;
  user_id: number;
  skill_name: string;
  sub_skills: SubSkillData[]; // ⚡ notice difference
  status: 'pending' | 'approved' | 'rejected';
  manager_comments?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}


export interface SubSkillData {
  name: string;
  proficiency: number;
  experience: number;
  hasCertification: boolean;
  certificationFile?: File;
}

export interface SkillFilter {
  skill?: string;
  proficiency?: number;
  experience?: number;
  hasCertification?: boolean;
}