"""
Database Seeding Script for Student Performance Tracker.
Generates 100 realistic students, 5 teachers, courses, enrollments,
attendance logs, assignment submissions, grades, and calendar events.
"""
import sys
import os
import random
from datetime import date, timedelta, datetime
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv(override=True)

import models
import database
import auth

def seed_database():
    # Ensure tables are created first
    models.Base.metadata.create_all(bind=database.engine)
    
    db = next(database.get_db())
    print("[INFO] Connected to database.")

    # 1. Clean existing records (optional, but good for a fresh start)
    db.query(models.QRSession).delete()
    db.query(models.AssignmentSubmission).delete()
    db.query(models.Assignment).delete()
    db.query(models.ClassSchedule).delete()
    db.query(models.ExamSchedule).delete()
    db.query(models.CalendarEvent).delete()
    db.query(models.Announcement).delete()
    db.query(models.AttendanceIssue).delete()
    db.query(models.Attendance).delete()
    db.query(models.Enrollment).delete()
    db.query(models.Grade).delete()
    db.query(models.Course).delete()
    db.query(models.Student).delete()
    db.query(models.Teacher).delete()
    # Delete all users EXCEPT the Super Admin we seeded earlier
    super_admin_email = os.getenv("SUPER_ADMIN_EMAIL", "ujjwalchauhan671@gmail.com")
    db.query(models.User).filter(models.User.email != super_admin_email).delete()
    db.commit()

    # 2. Seed Teachers
    print("[INFO] Seeding Teachers...")
    teachers_data = [
        {"name": "Dr. Vikram Sarabhai", "email": "sarabhai@university.edu", "password": "password123", "bio": "Professor of Computing and Algorithms. Passionate about machine intelligence."},
        {"name": "Prof. C.V. Raman", "email": "raman@university.edu", "password": "password123", "bio": "Compiler design specialist and pioneer in programming languages."},
        {"name": "Dr. Homi Bhabha", "email": "bhabha@university.edu", "password": "password123", "bio": "Quantum computing theorist and Physics department head."},
        {"name": "Prof. Jagadish Chandra Bose", "email": "jcbose@university.edu", "password": "password123", "bio": "Information theory specialist and communication systems researcher."},
        {"name": "Dr. APJ Abdul Kalam", "email": "kalam@university.edu", "password": "password123", "bio": "Pioneer in analytical engine algorithms and computing history."}
    ]

    teacher_users = []
    for t in teachers_data:
        user = models.User(
            name=t["name"],
            email=t["email"],
            password=auth.hash_password(t["password"]),
            role="teacher",
            is_approved=1,
            bio=t["bio"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create Teacher Profile
        profile = models.Teacher(user_id=user.id)
        db.add(profile)
        teacher_users.append(user)
    
    print(f"[OK] Seeded {len(teacher_users)} teachers.")

    # 3. Seed Courses
    print("[INFO] Seeding Courses...")
    courses_data = [
        {"name": "Design & Analysis of Algorithms", "teacher": teacher_users[0], "semester": 3},
        {"name": "Theory of Computation", "teacher": teacher_users[0], "semester": 5},
        {"name": "Compiler Construction", "teacher": teacher_users[1], "semester": 5},
        {"name": "Programming in Python", "teacher": teacher_users[1], "semester": 1},
        {"name": "Quantum Computing & Circuits", "teacher": teacher_users[2], "semester": 7},
        {"name": "Digital Logic & Design", "teacher": teacher_users[2], "semester": 1},
        {"name": "Information Theory & Coding", "teacher": teacher_users[3], "semester": 7},
        {"name": "Computer Networks", "teacher": teacher_users[3], "semester": 5},
        {"name": "Software Engineering Principles", "teacher": teacher_users[4], "semester": 3},
        {"name": "Database Management Systems", "teacher": teacher_users[4], "semester": 3}
    ]

    courses = []
    for c in courses_data:
        course = models.Course(
            name=c["name"],
            teacher_id=c["teacher"].id,
            semester=c["semester"]
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        courses.append(course)

    print(f"[OK] Seeded {len(courses)} courses.")

    # 4. Seed 100 Students
    print("[INFO] Seeding 100 Students...")
    first_names = [
        "Aarav", "Aditya", "Akash", "Ananya", "Arjun", "Dev", "Diya", "Ishaan", "Kabir", "Meera",
        "Neha", "Pranav", "Rohan", "Siddharth", "Tanisha", "Vihaan", "Aarushi", "Amit", "Rahul", "Priya",
        "Sunita", "Rajesh", "Vikram", "Suresh", "Ramesh", "Deepak", "Sanjay", "Anil", "Sunil", "Alok",
        "Vivek", "Karan", "Kunal", "Riya", "Kriti", "Shreya", "Aditi", "Pooja", "Kiran", "Divya",
        "Harish", "Gopal", "Madhav", "Krishna", "Radha", "Sita", "Gita", "Lata", "Asha", "Usha",
        "Abhishek", "Abhinav", "Aditi", "Aishwarya", "Ajay", "Alok", "Anjali", "Ankit", "Ankita", "Anshul",
        "Archana", "Arpit", "Ashi", "Ashish", "Avinash", "Ayush", "Bhupendra", "Deepa", "Deepika", "Dinesh",
        "Gaurav", "Himanshu", "Jatin", "Jyoti", "Kailash", "Ketan", "Lokesh", "Manish", "Manisha", "Manoj",
        "Mayank", "Navin", "Nisha", "Nitin", "Pankaj", "Pradeep", "Preeti", "Rajeev", "Rashmi", "Ravi",
        "Sandeep", "Sapna", "Seema", "Shalini", "Sheetal", "Shikha", "Shivani", "Tarun", "Vijay", "Yash"
    ]
    last_names = [
        "Sharma", "Verma", "Gupta", "Patel", "Mehta", "Singh", "Joshi", "Chawla", "Rao", "Nair",
        "Chauhan", "Sen", "Das", "Roy", "Bose", "Dutta", "Iyer", "Trivedi", "Mishra", "Pandey",
        "Chatterjee", "Mukherjee", "Banerjee", "Kulkarni", "Deshmukh", "Patil", "Reddy", "Pillai",
        "Choudhury", "Dasgupta", "Saxena", "Srivastava", "Dwivedi", "Tripathi", "Pathak", "Dubey",
        "Yadav", "Kumar", "Prasad", "Ranjan", "Sinha", "Choudhary", "Grover", "Kapoor", "Khanna", "Malhotra"
    ]

    student_users = []
    # Seed equal numbers of students in semesters 1, 3, 5, 7
    semesters = [1, 3, 5, 7]
    for i in range(100):
        fname = first_names[i % len(first_names)]
        lname = last_names[random.randint(0, len(last_names)-1)]
        name = f"{fname} {lname}"
        email = f"{fname.lower()}.{lname.lower()}{random.randint(10,99)}@university.edu"
        semester = semesters[i % len(semesters)]

        user = models.User(
            name=name,
            email=email,
            password=auth.hash_password("student123"),
            role="student",
            semester=semester,
            is_approved=1,
            bio=f"CS major, class of {2029 - semester//2}."
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create Student Profile
        profile = models.Student(user_id=user.id, semester=semester)
        db.add(profile)
        student_users.append(user)

    print(f"[OK] Seeded {len(student_users)} student user profiles.")

    # 5. Enroll Students in Courses & Seed Attendance / Grades
    print("[INFO] Enrolling students and generating performance data...")
    enrollment_count = 0
    attendance_count = 0
    grade_count = 0

    # Let's seed attendance logs for the last 15 days
    today = date.today()
    date_list = [today - timedelta(days=x) for x in range(15)]
    # Filter out Sundays (Sunday is index 6 in weekday())
    date_list = [d for d in date_list if d.weekday() != 6]

    for student in student_users:
        # Find courses offered in this student's semester
        matching_courses = [c for c in courses if c.semester == student.semester]
        
        for course in matching_courses:
            # Create Enrollment
            enrollment = models.Enrollment(
                student_id=student.id,
                course_id=course.id,
                semester=student.semester
            )
            db.add(enrollment)
            enrollment_count += 1

            # Seed Attendance (85% attendance average)
            for d in date_list:
                status = "Present" if random.random() < 0.88 else "Absent"
                attendance = models.Attendance(
                    student_id=student.id,
                    course_id=course.id,
                    date=d,
                    status=status
                )
                db.add(attendance)
                attendance_count += 1
                
                # If absent, occasionally add an Attendance Issue
                if status == "Absent" and random.random() < 0.15:
                    issue = models.AttendanceIssue(
                        student_id=student.id,
                        course_id=course.id,
                        date=d,
                        reason=random.choice([
                            "Medical checkup / high fever",
                            "Family emergency at hometown",
                            "Missed public transport bus",
                            "Attending university sports meet"
                        ]),
                        status=random.choice(["Pending", "Approved", "Rejected"]),
                        remark="Approved on medical proof verification"
                    )
                    db.add(issue)

            # Seed Midterm Grade
            mid_marks = random.randint(55, 99)
            mid_grade = models.Grade(
                student_id=student.id,
                course_id=course.id,
                semester=student.semester,
                exam_type="mid",
                marks=mid_marks
            )
            db.add(mid_grade)
            grade_count += 1

            # Seed Endterm Grade (usually correlated to midterm performance)
            end_marks = min(100, max(0, mid_marks + random.randint(-8, 8)))
            end_grade = models.Grade(
                student_id=student.id,
                course_id=course.id,
                semester=student.semester,
                exam_type="end",
                marks=end_marks
            )
            db.add(end_grade)
            grade_count += 1

    db.commit()
    print(f"[OK] Created {enrollment_count} enrollments.")
    print(f"[OK] Generated {attendance_count} attendance records.")
    print(f"[OK] Generated {grade_count} mid/end-term grades.")

    # 6. Seed Assignments and Submissions
    print("[INFO] Seeding Assignments & Submissions...")
    assignments_data = [
        {"title": "Algorithms Analysis Homework 1", "desc": "Asymptotic notation analysis & Master Method questions.", "course": courses[0]},
        {"title": "Compiler Syntax Tree Assignment", "desc": "Build a shift-reduce parser using lex & yacc tools.", "course": courses[2]},
        {"title": "IP Subnetting Worksheet", "desc": "Divide the class B block into subnets with host capacities.", "course": courses[7]}
    ]

    for a_data in assignments_data:
        assignment = models.Assignment(
            course_id=a_data["course"].id,
            title=a_data["title"],
            description=a_data["desc"],
            due_date=today - timedelta(days=2),
            max_marks=100
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)

        # Get enrolled students
        enrolled_students = db.query(models.Enrollment).filter(models.Enrollment.course_id == a_data["course"].id).all()
        for enrollment in enrolled_students:
            # 90% submission rate
            if random.random() < 0.90:
                marks = random.randint(65, 100)
                submission = models.AssignmentSubmission(
                    assignment_id=assignment.id,
                    student_id=enrollment.student_id,
                    submission_text="Here is my code implementation. I tested all edge cases and verified standard runtimes.",
                    submitted_at=datetime.now() - timedelta(days=random.randint(3, 7)),
                    status="Graded",
                    marks_obtained=marks,
                    feedback=random.choice(["Exemplary work!", "Good structure, check edge case handling", "Well explained reasoning.", "Excellent formatting."])
                )
                db.add(submission)
    
    db.commit()
    print("[OK] Seeded Assignments & Submissions.")

    # 7. Seed Calendar Events & Announcements
    print("[INFO] Seeding Calendar Events and Announcements...")
    calendar_events = [
        models.CalendarEvent(title="Mid-Term Exams Week", description="Examinations for all semesters.", start_date=today + timedelta(days=10), end_date=today + timedelta(days=15), event_type="Event"),
        models.CalendarEvent(title="National Science Day Holiday", description="University closed.", start_date=today + timedelta(days=4), end_date=today + timedelta(days=4), event_type="Holiday"),
        models.CalendarEvent(title="Inter-University Coding Hackathon", description="Annual programming competition.", start_date=today + timedelta(days=25), end_date=today + timedelta(days=27), event_type="Event")
    ]
    for ev in calendar_events:
        db.add(ev)

    announcements = [
        models.Announcement(teacher_id=teacher_users[0].id, course_id=courses[0].id, title="Algorithm Exam Syllabus Update", content="The midterm will cover sorting algorithms, divide-and-conquer strategy, and dynamic programming algorithms. Keep reviewing runtime proofs."),
        models.Announcement(teacher_id=teacher_users[1].id, course_id=courses[2].id, title="Compiler Construct Lab Extended Hours", content="The laboratory will stay open until 9:00 PM for the upcoming Parser submission block. TA support is available.")
    ]
    for ann in announcements:
        db.add(ann)

    db.commit()
    print("[OK] Calendar Events & Announcements seeded.")
    print("\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULY! 🎉")

if __name__ == "__main__":
    seed_database()
