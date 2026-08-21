from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import io
import models
from controllers.student_controller import get_attendance_summary, get_grades_summary_by_semester

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_report_card_pdf(student_id: int, semester: int, db: Session):
    # Fetch student details
    student = db.query(models.User).filter(models.User.id == student_id, models.User.role == models.RoleEnum.student).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch grades and attendance summaries
    grades = get_grades_summary_by_semester(student_id, semester, db)
    attendance = get_attendance_summary(student_id, db)

    # Build PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles for clean, premium PDF design
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1A365D"),
        spaceAfter=15,
        alignment=1 # Centered
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#2B6CB0"),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2D3748")
    )
    
    header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=10,
        leading=12,
        textColor=colors.white,
        fontName='Helvetica-Bold'
    )

    story = []

    # Title
    story.append(Paragraph("STUDENT PERFORMANCE REPORT CARD", title_style))
    story.append(Spacer(1, 10))

    # Student Info Table
    info_data = [
        [
            Paragraph("<b>Student Name:</b>", body_style), Paragraph(str(student.name or "Unknown Student"), body_style),
            Paragraph("<b>Semester:</b>", body_style), Paragraph(str(semester), body_style)
        ],
        [
            Paragraph("<b>Email:</b>", body_style), Paragraph(str(student.email or ""), body_style),
            Paragraph("<b>Student ID:</b>", body_style), Paragraph(str(student.id), body_style)
        ]
    ]
    info_table = Table(info_data, colWidths=[100, 180, 80, 140])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,-1), (-1,-1), 1, colors.HexColor("#E2E8F0")),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # Grades Section
    story.append(Paragraph("Academic Grades", section_heading))
    
    # Table headers: Course Name, Midterm Grade, End Sem Grade
    grades_data = [[
        Paragraph("Course Name", header_style),
        Paragraph("Midterm Grade (100)", header_style),
        Paragraph("End Sem Grade (100)", header_style)
    ]]
    
    for g in grades:
        mid_val = str(g["mid"]) if g["mid"] is not None else "N/A"
        end_val = str(g["end"]) if g["end"] is not None else "N/A"
        grades_data.append([
            Paragraph(str(g["course_name"] or f"Course {g.get('course_id', 'Unknown')}"), body_style),
            Paragraph(mid_val, body_style),
            Paragraph(end_val, body_style)
        ])
        
    grades_table = Table(grades_data, colWidths=[240, 130, 130])
    grades_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B6CB0")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F7FAFC")]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
    ]))
    story.append(grades_table)
    story.append(Spacer(1, 20))

    # Attendance Section
    story.append(Paragraph("Attendance Record", section_heading))
    
    attendance_data = [[
        Paragraph("Course Name", header_style),
        Paragraph("Present", header_style),
        Paragraph("Total Classes", header_style),
        Paragraph("Percentage", header_style)
    ]]
    
    # Filter by course summaries
    by_course_att = attendance.get("by_course", [])
    for att in by_course_att:
        attendance_data.append([
            Paragraph(str(att["course_name"] or f"Course {att.get('course_id', 'Unknown')}"), body_style),
            Paragraph(str(att["present"]), body_style),
            Paragraph(str(att["total"]), body_style),
            Paragraph(f"{att['percentage']}%", body_style)
        ])
        
    # Append overall attendance row
    overall_att = attendance.get("overall", {"present": 0, "total": 0, "percentage": 0.0})
    attendance_data.append([
        Paragraph("<b>Overall Attendance</b>", body_style),
        Paragraph(str(overall_att["present"]), body_style),
        Paragraph(str(overall_att["total"]), body_style),
        Paragraph(f"<b>{overall_att['percentage']}%</b>", body_style)
    ])
    
    attendance_table = Table(attendance_data, colWidths=[210, 90, 100, 100])
    attendance_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#4A5568")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor("#F7FAFC")]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
    ]))
    story.append(attendance_table)
    
    # Build Document
    doc.build(story)
    buffer.seek(0)
    
    # Return as StreamingResponse
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ReportCard_Sem{semester}_{student.name.replace(' ', '_')}.pdf"}
    )
