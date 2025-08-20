from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
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
async def create_skill(
    skill_data: SkillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create main skill
    skill = Skill(
        user_id=current_user.id,
        skill_name=skill_data.skill_name,
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(skill)
    await db.commit()
    await db.refresh(skill)

    # Create sub-skills
    sub_skills_list = []
    for sub_skill_data in skill_data.sub_skills:
        sub_skill = SubSkill(
            skill_id=skill.id,
            sub_skill_name=sub_skill_data.sub_skill_name,
            employee_proficiency=sub_skill_data.employee_proficiency,
            experience_years=sub_skill_data.experience_years,
            has_certification=sub_skill_data.has_certification,
            certification_file_url=sub_skill_data.certification_file_url,
            created_at=datetime.utcnow()
        )
        db.add(sub_skill)
        await db.commit()
        await db.refresh(sub_skill)

        sub_skills_list.append(
            SubSkillResponse(
                id=sub_skill.id,
                skill_id=sub_skill.skill_id,
                sub_skill_name=sub_skill.sub_skill_name,
                employee_proficiency=sub_skill.employee_proficiency,
                experience_years=sub_skill.experience_years,
                has_certification=sub_skill.has_certification,
                certification_file_url=sub_skill.certification_file_url,
                created_at=sub_skill.created_at,
                manager_proficiency=sub_skill.manager_proficiency,
                status=sub_skill.status,
                manager_comments=sub_skill.manager_comments,
                last_updated_at=sub_skill.last_updated_at
            )
        )

    # Prepare SkillResponse
    skill_response = SkillResponse(
        id=skill.id,
        user_id=skill.user_id,
        skill_name=skill.skill_name,
        status=skill.status,
        created_at=skill.created_at,
        last_updated_at=skill.last_updated_at,
        manager_comments=skill.manager_comments,
        sub_skills=sub_skills_list
    )

    return skill_response

# -------------------- Get My Skills --------------------
@router.get("/my-skills")
async def get_my_skills(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Skill)
        .options(joinedload(Skill.sub_skills))
        .where(Skill.user_id == current_user.id)
    )
    skills = result.unique().scalars().all()

    skill_list = []
    for skill in skills:
        skill_list.append({
            "id": skill.id,
            "user_id": skill.user_id,
            "skill_name": skill.skill_name,
            "created_at": skill.created_at,
            "sub_skills": [
                {
                    "id": sub.id,
                    "skill_id": sub.skill_id,
                    "sub_skill_name": sub.sub_skill_name,
                    "employee_proficiency": sub.employee_proficiency,
                    "manager_proficiency": sub.manager_proficiency,
                    "experience_years": sub.experience_years,
                    "has_certification": sub.has_certification,
                    "certification_file_url": sub.certification_file_url,
                    "status": sub.status.value,  # send as string
                    "manager_comments": sub.manager_comments,
                    "created_at": sub.created_at,
                } for sub in skill.sub_skills
            ]
        })
    return skill_list
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
