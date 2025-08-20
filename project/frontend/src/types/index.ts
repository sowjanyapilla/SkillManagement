export interface User {
  id: number;
  email: string;
  name: string;
  employee_id: string;
  is_manager: boolean;
  manager_id: number | null;   // nullable because sometimes it can be null
  created_at?: string;         // optional if not always included
  avatar_url?: string;         // optional if you plan to add later
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
  proficiency_level: number;
  experience_years: number;
  has_certification: boolean;
  certification_file_url?: string;
  created_at: string;
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