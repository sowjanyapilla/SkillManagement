from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional

from database import get_db
from models.user import User
from models.skill import Skill, SubSkill, SkillStatus
from schemas.skill import SkillCreate, SkillResponse, SubSkillCreate, SubSkillResponse, SkillFilter
from routes.auth import get_current_user

from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/skills", tags=["skills"])

# -------------------- Create a Skill with SubSkills --------------------
@router.post("/", response_model=SkillResponse)
def create_skill(
    skill_data: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = Skill(
        user_id=current_user.id,
        skill_name=skill_data.skill_name
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    for sub_skill_data in skill_data.sub_skills:
        sub_skill = SubSkill(
            skill_id=skill.id,
            sub_skill_name=sub_skill_data.sub_skill_name,
            employee_proficiency=sub_skill_data.employee_proficiency,
            experience_years=sub_skill_data.experience_years,
            has_certification=sub_skill_data.has_certification,
            certification_file_url=sub_skill_data.certification_file_url
        )
        db.add(sub_skill)
    
    db.commit()
    db.refresh(skill)
    return SkillResponse.model_validate(skill)

# -------------------- Get My Skills --------------------
@router.get("/my-skills")
async def get_my_skills(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Skill)
        .options(joinedload(Skill.sub_skills))  # if you want nested sub-skills
        .where(Skill.user_id == current_user.id)
    )
    skills = result.unique().scalars().all()
    return skills
# -------------------- Get a Single Skill --------------------
@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = db.query(Skill).filter(
        and_(Skill.id == skill_id, Skill.user_id == current_user.id)
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return SkillResponse.model_validate(skill)

# -------------------- Delete a Skill --------------------
@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = db.query(Skill).filter(
        and_(Skill.id == skill_id, Skill.user_id == current_user.id)
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted successfully"}

# -------------------- Filter Skills (Optional) --------------------
@router.get("/matching", response_model=List[SkillResponse])
def get_matching_skills(
    skill: Optional[str] = Query(None),
    proficiency: Optional[int] = Query(None),
    experience: Optional[float] = Query(None),
    has_certification: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Skill).filter(
        and_(
            Skill.user_id == current_user.id,
            Skill.status == SkillStatus.APPROVED
        )
    )

    if skill or proficiency or experience or has_certification is not None:
        query = query.join(SubSkill)

        if skill:
            query = query.filter(
                or_(
                    Skill.skill_name.ilike(f"%{skill}%"),
                    SubSkill.sub_skill_name.ilike(f"%{skill}%")
                )
            )

        if proficiency:
            query = query.filter(SubSkill.employee_proficiency >= proficiency)
        
        if experience:
            query = query.filter(SubSkill.experience_years >= experience)
        
        if has_certification is not None:
            query = query.filter(SubSkill.has_certification == has_certification)
    
    skills = query.distinct().all()
    return [SkillResponse.model_validate(skill) for skill in skills]
