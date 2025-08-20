# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import and_
# from typing import List
# from datetime import datetime

# from database import get_db
# from models.user import User
# from models.skill import Skill, SubSkill, SkillSubmission, SubSkillSubmission, SkillStatus
# from schemas.skill import SkillSubmissionResponse, SkillApprovalRequest
# from routes.auth import get_current_user

# router = APIRouter(prefix="/approvals", tags=["approvals"])

# @router.get("/pending", response_model=List[SkillSubmissionResponse])
# async def get_pending_approvals(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if not current_user.is_manager:
#         raise HTTPException(status_code=403, detail="Only managers can view approvals")
    
#     # Get pending submissions from subordinates
#     pending_submissions = db.query(SkillSubmission).join(User).filter(
#         and_(
#             User.manager_id == current_user.id,
#             SkillSubmission.status == SkillStatus.PENDING
#         )
#     ).all()
    
#     return [SkillSubmissionResponse.from_orm(submission) for submission in pending_submissions]

# @router.get("/all", response_model=List[SkillSubmissionResponse])
# async def get_all_approvals(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if not current_user.is_manager:
#         raise HTTPException(status_code=403, detail="Only managers can view approvals")
    
#     # Get all submissions from subordinates
#     submissions = db.query(SkillSubmission).join(User).filter(
#         User.manager_id == current_user.id
#     ).all()
    
#     return [SkillSubmissionResponse.from_orm(submission) for submission in submissions]

# @router.post("/{submission_id}/approve")
# async def approve_skill_submission(
#     submission_id: int,
#     approval_data: SkillApprovalRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if not current_user.is_manager:
#         raise HTTPException(status_code=403, detail="Only managers can approve skills")
    
#     # Get the submission
#     submission = db.query(SkillSubmission).join(User).filter(
#         and_(
#             SkillSubmission.id == submission_id,
#             User.manager_id == current_user.id,
#             SkillSubmission.status == SkillStatus.PENDING
#         )
#     ).first()
    
#     if not submission:
#         raise HTTPException(status_code=404, detail="Submission not found or already processed")
    
#     # Update submission status
#     if approval_data.action == "approve":
#         submission.status = SkillStatus.APPROVED
        
#         # Create approved skill and sub-skills
#         approved_skill = Skill(
#             user_id=submission.user_id,
#             skill_name=submission.skill_name,
#             status=SkillStatus.APPROVED,
#             manager_comments=approval_data.manager_comments
#         )
#         db.add(approved_skill)
#         db.commit()
#         db.refresh(approved_skill)
        
#         # Create sub-skills
#         for sub_submission in submission.sub_skill_submissions:
#             proficiency = sub_submission.proficiency_level
            
#             # Apply proficiency modifications if provided
#             if (approval_data.proficiency_modifications and 
#                 str(sub_submission.id) in approval_data.proficiency_modifications):
#                 proficiency = approval_data.proficiency_modifications[str(sub_submission.id)]
            
#             sub_skill = SubSkill(
#                 skill_id=approved_skill.id,
#                 sub_skill_name=sub_submission.sub_skill_name,
#                 proficiency_level=proficiency,
#                 experience_years=sub_submission.experience_years,
#                 has_certification=sub_submission.has_certification,
#                 certification_file_url=sub_submission.certification_file_url
#             )
#             db.add(sub_skill)
        
#     elif approval_data.action == "reject":
#         submission.status = SkillStatus.REJECTED
#     else:
#         raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
#     # Update submission metadata
#     submission.manager_comments = approval_data.manager_comments
#     submission.reviewed_at = datetime.utcnow()
#     submission.approved_by_id = current_user.id
    
#     db.commit()
#     db.refresh(submission)
    
#     return {
#         "message": f"Skill submission {approval_data.action}d successfully",
#         "submission": SkillSubmissionResponse.from_orm(submission)
#     }

# @router.get("/{submission_id}", response_model=SkillSubmissionResponse)
# async def get_skill_submission(
#     submission_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if not current_user.is_manager:
#         raise HTTPException(status_code=403, detail="Only managers can view submissions")
    
#     submission = db.query(SkillSubmission).join(User).filter(
#         and_(
#             SkillSubmission.id == submission_id,
#             User.manager_id == current_user.id
#         )
#     ).first()
    
#     if not submission:
#         raise HTTPException(status_code=404, detail="Submission not found")
    
#     return SkillSubmissionResponse.from_orm(submission)