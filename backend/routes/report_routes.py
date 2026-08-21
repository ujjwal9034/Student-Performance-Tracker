from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database
from controllers import report_controller

router = APIRouter(prefix="/report", tags=["Report Card"])

@router.get("/student/{student_id}/semester/{semester}/download")
def download_report_card(student_id: int, semester: int, db: Session = Depends(database.get_db)):
    return report_controller.generate_report_card_pdf(student_id, semester, db)
