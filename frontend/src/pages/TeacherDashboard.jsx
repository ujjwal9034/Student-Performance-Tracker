import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiTeacher, apiAdmin, BASE_URL } from "../api";
import DashboardLayout from "../DashboardLayout";

const t = {
  en: {
    teacherDashboard: "Teacher Dashboard",
    attendanceDetail: "Attendance Detail",
    courseDetail: "Course Detail",
    recentIssues: "Recent Issues",
    announcements: "Announcements",
    atRiskAnalysis: "At-Risk Analysis",
    timetableManagement: "Timetable Management",
    assignmentsManagement: "Assignments Management",
    examsManagement: "Exams Management",
    gradesManagement: "Grades Management",
    activeCourses: "Active Courses",
    activeTabAttendance: "Attendance Detail",
    activeTabCourse: "Course Detail",
    activeTabIssues: "Recent Issues",
    activeTabAnnouncements: "Announcements",
    activeTabAtRisk: "At-Risk Analysis",
    activeTabTimetable: "Timetable Management",
    activeTabAssignments: "Assignments Management",
    activeTabExams: "Exams Management",
    activeTabGrades: "Grades Management"
  },
  hi: {
    teacherDashboard: "शिक्षक डैशबोर्ड",
    attendanceDetail: "उपस्थिति विवरण",
    courseDetail: "पाठ्यक्रम विवरण",
    recentIssues: "हाल के मुद्दे",
    announcements: "घोषणाएँ",
    atRiskAnalysis: "जोखिम विश्लेषण",
    timetableManagement: "समय-सारणी प्रबंधन",
    assignmentsManagement: "असाइनमेंट प्रबंधन",
    examsManagement: "परीक्षा प्रबंधन",
    gradesManagement: "ग्रेड प्रबंधन",
    activeCourses: "सक्रिय पाठ्यक्रम",
    activeTabAttendance: "उपस्थिति विवरण",
    activeTabCourse: "पाठ्यक्रम विवरण",
    activeTabIssues: "हाल के मुद्दे",
    activeTabAnnouncements: "घोषणाएँ",
    activeTabAtRisk: "जोखिम विश्लेषण",
    activeTabTimetable: "समय-सारणी प्रबंधन",
    activeTabAssignments: "असाइनमेंट प्रबंधन",
    activeTabExams: "परीक्षा प्रबंधन",
    activeTabGrades: "ग्रेड प्रबंधन"
  }
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");
  const [issues, setIssues] = useState([]);

  // i18n Lang support
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "en");
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  // Onboarding Tour states & steps
  const [tourStep, setTourStep] = useState(null);

  useEffect(() => {
    const tourDone = localStorage.getItem("onboarding_teacher_done");
    if (!tourDone) {
      setTourStep(0);
    }
  }, []);

  const tourSteps = [
    {
      title: lang === 'en' ? "👋 Welcome to AcadTrack Teacher Dashboard!" : "👋 ऐकडट्रैक शिक्षक डैशबोर्ड में आपका स्वागत है!",
      content: lang === 'en' 
        ? "This dashboard allows you to manage class attendance, grade assignments, track student academic performance, schedule mid/end term exams, and announce events." 
        : "यह डैशबोर्ड आपको कक्षा की उपस्थिति प्रबंधित करने, असाइनमेंट ग्रेड देने, छात्रों के शैक्षणिक प्रदर्शन को ट्रैक करने, परीक्षाओं का समय निर्धारित करने और कार्यक्रमों की घोषणा करने की अनुमति देता है।",
      style: { top: "180px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === 'en' ? "📝 Attendance & Grades" : "📝 उपस्थिति और ग्रेड",
      content: lang === 'en' 
        ? "Use the navigation tabs to mark daily attendance or add grades in bulk. You can even import grades via CSV!" 
        : "दैनिक उपस्थिति दर्ज करने या थोक में ग्रेड जोड़ने के लिए नेविगेशन टैब का उपयोग करें। आप सीएसवी के माध्यम से ग्रेड भी आयात कर सकते हैं!",
      style: { top: "340px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === 'en' ? "🚨 At-Risk Student Monitoring" : "🚨 जोखिम वाले छात्रों की निगरानी",
      content: lang === 'en' 
        ? "Identify at-risk students who have low attendance (below 75%) or failing grades so you can provide prompt assistance." 
        : "कम उपस्थिति (75% से कम) या अनुत्तीर्ण ग्रेड वाले छात्रों की पहचान करें ताकि आप त्वरित सहायता प्रदान कर सकें।",
      style: { top: "480px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === 'en' ? "🌓 Global Settings" : "🌓 वैश्विक सेटिंग्स",
      content: lang === 'en' 
        ? "Don't forget to use the theme toggle for dark/light preferences and the Hindi translation switch in the top Navbar." 
        : "शीर्ष नेविगेशन बार में डार्क/लाइट थीम टॉगल और हिंदी अनुवाद स्विच का उपयोग करना न भूलें।",
      style: { top: "90px", right: "20px" }
    }
  ];

  const handleNextStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      setTourStep(null);
      localStorage.setItem("onboarding_teacher_done", "true");
    }
  };

  const handleSkipTour = () => {
    setTourStep(null);
    localStorage.setItem("onboarding_teacher_done", "true");
  };

  // Attendance states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourseSummary, setSelectedCourseSummary] = useState("");
  const [courseSummary, setCourseSummary] = useState([]);
  const [overallSummary, setOverallSummary] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceSemester, setAttendanceSemester] = useState("");
  const [attendance, setAttendance] = useState({});

  // Announcements states
  const [teacherAnnouncements, setTeacherAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annCourseId, setAnnCourseId] = useState("");

  // At-Risk states
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [atRiskSemester, setAtRiskSemester] = useState(1);

  // Timetable states
  const [timetable, setTimetable] = useState([]);
  const [scheduleCourseId, setScheduleCourseId] = useState("");
  const [scheduleDay, setScheduleDay] = useState("Monday");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [scheduleRoom, setScheduleRoom] = useState("");

  // Assignments states
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [assCourseId, setAssCourseId] = useState("");
  const [assTitle, setAssTitle] = useState("");
  const [assDesc, setAssDesc] = useState("");
  const [assDueDate, setAssDueDate] = useState("");
  const [assMaxMarks, setAssMaxMarks] = useState(100);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmissionId, setGradingSubmissionId] = useState("");
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");

  // Exams states
  const [exams, setExams] = useState([]);
  const [examCourseId, setExamCourseId] = useState("");
  const [examType, setExamType] = useState("mid");
  const [examDate, setExamDate] = useState("");
  const [examStart, setExamStart] = useState("");
  const [examEnd, setExamEnd] = useState("");
  const [examRoom, setExamRoom] = useState("");

  // Calendar states
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calTitle, setCalTitle] = useState("");
  const [calDesc, setCalDesc] = useState("");
  const [calStart, setCalStart] = useState("");
  const [calEnd, setCalEnd] = useState("");
  const [calType, setCalType] = useState("Event");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  const [message, setMessage] = useState("");

  // Marks states
  const [marksSemester, setMarksSemester] = useState(1);
  const [marksExamType, setMarksExamType] = useState("mid");
  const [marksByStudent, setMarksByStudent] = useState({});

  // Courses states
  const [courseName, setCourseName] = useState("");
  const [courseSemester, setCourseSemester] = useState(1);

  // Enrollment states
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsCourseId, setEnrollmentsCourseId] = useState("");
  const [enrollmentsSemester, setEnrollmentsSemester] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  // Issue states
  const [issueId, setIssueId] = useState("");
  const [issueStatus, setIssueStatus] = useState("Approved");
  const [issueRemark, setIssueRemark] = useState("");

  const [savingAttendance, setSavingAttendance] = useState(false);

  // Smart QR Attendance states
  const [qrCourseId, setQrCourseId] = useState("");
  const [qrDuration, setQrDuration] = useState(5);
  const [activeQRSession, setActiveQRSession] = useState(null);
  const [qrScannedStudents, setQrScannedStudents] = useState([]);
  const [qrSecondsRemaining, setQrSecondsRemaining] = useState(0);
  const [qrMessage, setQrMessage] = useState("");
  const [qrSuccess, setQrSuccess] = useState(false);

  // Helper to parse naive ISO string as local date/time safely
  const parseLocalISOString = (str) => {
    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (m) {
      return new Date(
        parseInt(m[1], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10),
        parseInt(m[4], 10),
        parseInt(m[5], 10),
        parseInt(m[6], 10)
      );
    }
    return new Date(str);
  };

  // QR session countdown timer and polling for scans
  useEffect(() => {
    let timerInterval = null;
    let pollInterval = null;

    if (activeQRSession && activeQRSession.expires_at) {
      const calculateSecondsRemaining = () => {
        const expiry = parseLocalISOString(activeQRSession.expires_at).getTime();
        const now = new Date().getTime();
        return Math.max(0, Math.floor((expiry - now) / 1000));
      };

      setQrSecondsRemaining(calculateSecondsRemaining());

      timerInterval = setInterval(() => {
        const remaining = calculateSecondsRemaining();
        setQrSecondsRemaining(remaining);
        if (remaining <= 0) {
          setActiveQRSession(null);
          setQrMessage(lang === "en" ? "QR code session has expired." : "क्यूआर कोड सत्र समाप्त हो गया है।");
          setQrSuccess(false);
          clearInterval(timerInterval);
          clearInterval(pollInterval);
        }
      }, 1000);

      const pollScans = async () => {
        try {
          const scans = await apiTeacher.getQRSessionScans(activeQRSession.session_token);
          setQrScannedStudents(scans || []);
        } catch (err) {
          console.error("Failed to fetch QR scans:", err);
        }
      };

      pollScans();
      pollInterval = setInterval(pollScans, 5000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeQRSession, lang]);

  const handleCreateQRSession = async (e) => {
    if (e) e.preventDefault();
    if (!qrCourseId) {
      setQrMessage(lang === "en" ? "Please select a course." : "कृपया एक पाठ्यक्रम चुनें।");
      setQrSuccess(false);
      return;
    }
    setQrMessage("");
    try {
      const payload = {
        course_id: Number(qrCourseId),
        duration_minutes: Number(qrDuration) || 5
      };
      const data = await apiTeacher.createQRSession(payload);
      setActiveQRSession(data);
      setQrScannedStudents([]);
      setQrMessage(lang === "en" ? "QR session generated successfully!" : "क्यूआर सत्र सफलतापूर्वक उत्पन्न हुआ!");
      setQrSuccess(true);
    } catch (err) {
      setQrMessage(err.message || (lang === "en" ? "Failed to create QR session." : "क्यूआर सत्र बनाने में विफल।"));
      setQrSuccess(false);
    }
  };

  const handleStopQRSession = () => {
    setActiveQRSession(null);
    setQrMessage(lang === "en" ? "QR attendance session stopped." : "क्यूआर उपस्थिति सत्र रोक दिया गया है।");
    setQrSuccess(true);
  };

  // Fetch courses
  useEffect(() => {
    if (user?.id) {
      apiTeacher
        .getCourses(user.id)
        .then((data) => setCourses(data))
        .catch((err) => console.error(err));
    }
  }, [user]);
  
  // Fetch issues
  useEffect(() => {
    if (activeTab === "issues" && user?.id) {
      fetchIssues();
    }
  }, [activeTab, user?.id]);

  const fetchTeacherAnnouncements = async () => {
    if (!user?.id) return;
    try {
      const data = await apiTeacher.getAnnouncements(user.id);
      setTeacherAnnouncements(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadAtRisk = async () => {
    if (!user?.id || !atRiskSemester) return;
    try {
      const data = await apiTeacher.getAtRiskStudents({
        teacher_id: user.id,
        semester: Number(atRiskSemester)
      });
      setAtRiskStudents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    if (!user?.id) return;
    try {
      const data = await apiTeacher.getTimetable(user.id);
      setTimetable(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeacherAssignments = async () => {
    if (!user?.id) return;
    try {
      const data = await apiTeacher.getAssignments(user.id);
      setTeacherAssignments(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    if (!user?.id) return;
    try {
      const data = await apiTeacher.getExams(user.id);
      setExams(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const data = await apiAdmin.getCalendarEvents();
      setCalendarEvents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTeacherAnnouncements();
      fetchTimetable();
      fetchTeacherAssignments();
      fetchExams();
      fetchCalendarEvents();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && atRiskSemester) {
      handleLoadAtRisk();
    }
  }, [user?.id, atRiskSemester]);
  
  // Fetch students
  useEffect(() => {
    if (selectedCourse && attendanceSemester) {
      apiTeacher
        .getStudentsInCourseBySemester({ course_id: Number(selectedCourse), semester: Number(attendanceSemester) })
        .then((data) => {
          setStudents(data);
          const initial = {};
          data.forEach((s) => { initial[s.id] = "present"; });
          setAttendance(initial);
          const initialMarks = {};
          data.forEach((s) => { initialMarks[s.id] = ""; });
          setMarksByStudent(initialMarks);
        })
        .catch((err) => console.error(err));
    } else {
      setStudents([]);
      setAttendance({});
      setMarksByStudent({});
    }
  }, [selectedCourse, attendanceSemester]);

  // Load attendance
  useEffect(() => {
    const shouldLoad = activeTab === "attendance" && selectedCourse && selectedDate && attendanceSemester;
    if (!shouldLoad) return;
    (async () => {
      try {
        const existing = await apiTeacher.getAttendance({ course_id: Number(selectedCourse), date: selectedDate, semester: attendanceSemester });
        if (Array.isArray(existing) && existing.length > 0) {
          setAttendance((prev) => {
            const next = { ...prev };
            existing.forEach((row) => {
              next[row.id] = row.status;
            });
            return next;
          });
          setMessage("Loaded existing attendance. You can edit and resubmit.");
        }
      } catch (err) {
        console.log(err)
      }
    })();
  }, [activeTab, selectedCourse, selectedDate, attendanceSemester]);

  // Load marks
  useEffect(() => {
    if (students.length > 0 && selectedCourse && marksSemester) {
      (async () => {
        try {
          await handleLoadExistingMarks(students);
        } catch (_) {
          // ignore
        }
      })();
    }
  }, [marksExamType]);

  // Fetch issues
  const fetchIssues = async () => {
    try {
      const data = await apiTeacher.getIssues(user.id);
      setIssues(data);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    }
  };

  // Set status
  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedCourse || !selectedDate || !attendanceSemester) {
      setMessage("Please select course, date, and semester.");
      return;
    }

    const records = students.map((s) => ({
      student_id: s.id,
      course_id: Number(selectedCourse),
      date: selectedDate,
      status: attendance[s.id],
    }));

    try {
      setSavingAttendance(true);
      const res = await apiTeacher.recordBulkAttendance({ course_id: Number(selectedCourse), date: selectedDate, records });
      const info = [];
      if (typeof res.inserted === "number") info.push(`${res.inserted} inserted`);
      if (typeof res.updated === "number") info.push(`${res.updated} updated`);
      setMessage(res.message + (info.length ? ` (${info.join(", ")})` : ""));
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error submitting attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Create course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiTeacher.createCourse({ name: courseName, teacher_id: user.id, semester: Number(courseSemester) });
      setMessage("Course created successfully!");
      setCourseName("");
      setCourseSemester(1);
      const refreshed = await apiTeacher.getCourses(user.id);
      setCourses(refreshed);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Set marks
  const setMarks = (studentId, value) => {
    setMarksByStudent((prev) => ({ ...prev, [studentId]: value }));
  };

  // Submit marks
  const handleSubmitMarks = async () => {
    if (!selectedCourse) {
      setMessage("Please select a course.");
      return;
    }
    if (!marksSemester || !Number(marksSemester)) {
      setMessage("Provide valid semester.");
      return;
    }
    const records = students.map((s) => ({ student_id: s.id, marks: Number(marksByStudent[s.id] || 0) }));
    try {
      const res = await apiTeacher.upsertMarksBulk({
        course_id: Number(selectedCourse),
        semester: Number(marksSemester),
        exam_type: marksExamType,
        records,
      });
      setMessage(res.message || "Marks saved");
    } catch (err) {
      setMessage(err.message || "Failed to save marks");
    }
  };

  // Load enrollments
  const handleLoadEnrollments = async () => {
    setMessage("");
    if (!enrollmentsCourseId || !enrollmentsSemester) {
      setMessage("Select course and semester to view enrollments.");
      return;
    }
    try {
      const students = await apiTeacher.getStudentsInCourseBySemester({ course_id: Number(enrollmentsCourseId), semester: Number(enrollmentsSemester) });
      setEnrollments(students.map(s => ({ id: s.id, name: s.name, email: s.email })));
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Enroll students
  const handleEnrollStudents = async (e) => {
    if (e) e.preventDefault();
    setMessage("");
    try {
      const ids = selectedStudentIds.map((x) => Number(x));
      if (ids.length === 0) {
        setMessage("Please select at least one student");
        return;
      }
      if (!enrollCourseId) {
        setMessage("Please select a course");
        return;
      }
      await apiTeacher.enrollStudents({ course_id: Number(enrollCourseId), student_ids: ids });
      setMessage("Students enrolled successfully!");
      setSelectedStudentIds([]);
      if (selectedCourse && Number(enrollCourseId) === Number(selectedCourse)) {
        const data = await apiTeacher.getStudentsInCourse(selectedCourse);
        setStudents(data);
        const initial = {};
        data.forEach((s) => {
          initial[s.id] = "present";
        });
        setAttendance(initial);
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setMessage(err.message || "Failed to enroll students");
    }
  };

  // Load available students
  const handleLoadAvailableStudents = async () => {
    setMessage("");

    try {
      const params = {};

      if (filterSemester && !isNaN(filterSemester)) {
        params.semester = Number(filterSemester);
      }

      if (enrollCourseId) {
        params.course_id = Number(enrollCourseId);
      }

      params.exclude_enrolled = true;

      const data = await apiTeacher.listStudents(params);
      setAvailableStudents(data);

      if (data.length === 0) {
        setMessage("No students found for selected filters.");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Toggle student selection
  const toggleStudentSelect = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Resolve issue
  const handleResolveIssue = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiTeacher.resolveIssue({ issue_id: Number(issueId), status: issueStatus, remark: issueRemark });
      setMessage(`Issue ${issueStatus.toLowerCase()} successfully!`);
      setIssueId("");
      setIssueRemark("");
      setIssueStatus("Approved");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Load students for marks
  const handleLoadStudents = async () => {
    setMessage("");
    if (!selectedCourse || !marksSemester) {
      setMessage("Select course and semester to load students.");
      return;
    }

    try {
      const data = await apiTeacher.getStudentsInCourseBySemester({
        course_id: Number(selectedCourse),
        semester: Number(marksSemester),
      });

      setStudents(data);

      if (data.length === 0) {
        setMessage("No students found for this course and semester.");
        setMarksByStudent({});
        return;
      }

      await handleLoadExistingMarks(data);
      setMessage("Loaded students and existing marks (if any).");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error loading students.");
    }
  };

  // Load existing marks
  const handleLoadExistingMarks = async (studentsData) => {
    if (!selectedCourse || !marksSemester) return;

    try {
      const existingMarks = await apiTeacher.getMarks({
        course_id: Number(selectedCourse),
        semester: Number(marksSemester),
        exam_type: marksExamType,
      });

      const marksMap = {};
      studentsData.forEach((s) => {
        const found = existingMarks.find((m) => m.student_id === s.id);
        marksMap[s.id] = found ? found.marks : "";
      });

      setMarksByStudent(marksMap);
    } catch (err) {
      console.error("Error loading existing marks:", err);
      const marksMap = {};
      studentsData.forEach((s) => {
        marksMap[s.id] = "";
      });
      setMarksByStudent(marksMap);
    }
  };

  // Announcement Handlers
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!annTitle || !annContent) {
      setMessage("Announcement title and content are required.");
      return;
    }
    try {
      await apiTeacher.createAnnouncement({
        teacher_id: user.id,
        course_id: annCourseId ? Number(annCourseId) : null,
        title: annTitle,
        content: annContent,
      });
      setMessage("Announcement created successfully!");
      setAnnTitle("");
      setAnnContent("");
      setAnnCourseId("");
      fetchTeacherAnnouncements();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setMessage("");
    try {
      await apiTeacher.deleteAnnouncement(id);
      setMessage("Announcement deleted successfully!");
      fetchTeacherAnnouncements();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete announcement");
    }
  };

  // Timetable Handlers
  const handleCreateTimetable = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!scheduleCourseId || !scheduleDay || !scheduleStart || !scheduleEnd || !scheduleRoom) {
      setMessage("All timetable slot fields are required.");
      return;
    }
    try {
      await apiTeacher.createTimetableSlot({
        course_id: Number(scheduleCourseId),
        day_of_week: scheduleDay,
        start_time: scheduleStart,
        end_time: scheduleEnd,
        room: scheduleRoom,
      });
      setMessage("Timetable slot created successfully!");
      setScheduleCourseId("");
      setScheduleStart("");
      setScheduleEnd("");
      setScheduleRoom("");
      fetchTimetable();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create timetable slot");
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule slot?")) return;
    setMessage("");
    try {
      await apiTeacher.deleteTimetableSlot(id);
      setMessage("Timetable slot deleted successfully!");
      fetchTimetable();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete timetable slot");
    }
  };

  // Assignment Handlers
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!assCourseId || !assTitle || !assDueDate || !assMaxMarks) {
      setMessage("Course, title, due date, and max marks are required.");
      return;
    }
    try {
      await apiTeacher.createAssignment({
        course_id: Number(assCourseId),
        title: assTitle,
        description: assDesc,
        due_date: assDueDate,
        max_marks: Number(assMaxMarks),
      });
      setMessage("Assignment created successfully!");
      setAssCourseId("");
      setAssTitle("");
      setAssDesc("");
      setAssDueDate("");
      setAssMaxMarks(100);
      fetchTeacherAssignments();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create assignment");
    }
  };

  const handleViewSubmissions = async (assignmentId) => {
    setMessage("");
    setSelectedAssignmentId(assignmentId);
    try {
      const data = await apiTeacher.getAssignmentSubmissions(assignmentId);
      setSubmissions(data || []);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to load submissions");
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!gradingSubmissionId || gradingMarks === "") {
      setMessage("Marks obtained is required.");
      return;
    }
    try {
      await apiTeacher.gradeSubmission({
        submission_id: Number(gradingSubmissionId),
        marks_obtained: Number(gradingMarks),
        feedback: gradingFeedback,
      });
      setMessage("Submission graded successfully!");
      setGradingSubmissionId("");
      setGradingMarks("");
      setGradingFeedback("");
      // Refresh submissions
      if (selectedAssignmentId) {
        const data = await apiTeacher.getAssignmentSubmissions(selectedAssignmentId);
        setSubmissions(data || []);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to grade submission");
    }
  };

  // Exam Handlers
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!examCourseId || !examType || !examDate || !examStart || !examEnd || !examRoom) {
      setMessage("All exam schedule fields are required.");
      return;
    }
    try {
      await apiTeacher.createExam({
        course_id: Number(examCourseId),
        exam_type: examType,
        date: examDate,
        start_time: examStart,
        end_time: examEnd,
        room: examRoom,
      });
      setMessage("Exam scheduled successfully!");
      setExamCourseId("");
      setExamDate("");
      setExamStart("");
      setExamEnd("");
      setExamRoom("");
      fetchExams();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to schedule exam");
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam schedule?")) return;
    setMessage("");
    try {
      await apiTeacher.deleteExam(id);
      setMessage("Exam schedule deleted successfully!");
      fetchExams();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete exam schedule");
    }
  };

  // Calendar Event Handlers
  const handleCreateCalendarEvent = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!calTitle || !calStart || !calEnd || !calType) {
      setMessage("Title, start date, end date, and event type are required.");
      return;
    }
    try {
      await apiAdmin.createCalendarEvent({
        title: calTitle,
        description: calDesc,
        start_date: calStart,
        end_date: calEnd,
        event_type: calType,
      });
      setMessage("Calendar event created successfully!");
      setCalTitle("");
      setCalDesc("");
      setCalStart("");
      setCalEnd("");
      setCalType("Event");
      fetchCalendarEvents();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create calendar event");
    }
  };

  const handleDeleteCalendarEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this calendar event?")) return;
    setMessage("");
    try {
      await apiAdmin.deleteCalendarEvent(id);
      setMessage("Calendar event deleted successfully!");
      fetchCalendarEvents();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete calendar event");
    }
  };

  // Custom visual monthly calendar component for academic events and exams on Teacher Dashboard
  const renderMonthlyCalendarGrid = (filterType) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const numDays = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

    const gridDays = [];
    
    const prevMonthNumDays = new Date(calYear, calMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      gridDays.push({
        day: prevMonthNumDays - i,
        isCurrentMonth: false,
        month: calMonth === 0 ? 11 : calMonth - 1,
        year: calMonth === 0 ? calYear - 1 : calYear
      });
    }

    for (let i = 1; i <= numDays; i++) {
      gridDays.push({
        day: i,
        isCurrentMonth: true,
        month: calMonth,
        year: calYear
      });
    }

    const remaining = 42 - gridDays.length;
    for (let i = 1; i <= remaining; i++) {
      gridDays.push({
        day: i,
        isCurrentMonth: false,
        month: calMonth === 11 ? 0 : calMonth + 1,
        year: calMonth === 11 ? calYear + 1 : calYear
      });
    }

    return (
      <div className="p-5 rounded-xl border bg-gray-50 border-gray-200 space-y-4 text-left">
        {/* Navigation */}
        <div className="flex justify-between items-center pb-2">
          <button
            type="button"
            onClick={() => {
              if (calMonth === 0) {
                setCalMonth(11);
                setCalYear(prev => prev - 1);
              } else {
                setCalMonth(prev => prev - 1);
              }
              setSelectedCalDay(null);
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
          >
            &larr; Prev
          </button>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest bg-white px-3 py-1 rounded border">
            {months[calMonth]} {calYear}
          </h4>
          <button
            type="button"
            onClick={() => {
              if (calMonth === 11) {
                setCalMonth(0);
                setCalYear(prev => prev + 1);
              } else {
                setCalMonth(prev => prev + 1);
              }
              setSelectedCalDay(null);
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
          >
            Next &rarr;
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase border-b pb-1">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {gridDays.map((cell, idx) => {
            const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
            
            const cellExams = exams.filter(e => e.date && e.date.substring(0, 10) === dateStr);
            const cellEvents = calendarEvents.filter(e => e.start_date && e.start_date.substring(0, 10) === dateStr);
            
            const hasExams = cellExams.length > 0;
            const hasEvents = cellEvents.length > 0;
            
            const isSelected = selectedCalDay && selectedCalDay.date === dateStr;

            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setSelectedCalDay({
                    date: dateStr,
                    exams: cellExams,
                    events: cellEvents
                  });
                }}
                className={`p-2 min-h-[50px] rounded-lg border flex flex-col justify-between items-start transition-all relative cursor-pointer ${
                  !cell.isCurrentMonth ? "opacity-20 border-transparent bg-transparent cursor-default" :
                  isSelected ? "bg-blue-100 border-blue-400" :
                  "bg-white border-gray-150 hover:bg-gray-50"
                }`}
                disabled={!cell.isCurrentMonth}
              >
                <span className={`text-[10px] font-bold ${cell.isCurrentMonth ? "text-gray-800" : "text-gray-400"}`}>
                  {cell.day}
                </span>
                
                {/* Dots / Indicators */}
                <div className="flex gap-1 mt-1 flex-wrap">
                  {hasExams && (filterType === "exams" || filterType === "both") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`${cellExams.length} Exams`} />
                  )}
                  {hasEvents && (filterType === "calendar" || filterType === "both") && (
                    cellEvents.map((ev, eIdx) => {
                      const isHoliday = ev.event_type === "Holiday";
                      return (
                        <span
                          key={eIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHoliday ? "bg-red-500" : "bg-green-500"
                          }`}
                          title={ev.title}
                        />
                      );
                    })
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected day details overlay */}
        {selectedCalDay && (
          <div className="mt-3 p-3.5 rounded-lg border border-gray-200 bg-white space-y-3 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
              <h5 className="font-bold text-blue-700 text-xs">
                Details for {new Date(selectedCalDay.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </h5>
              <button
                type="button"
                onClick={() => setSelectedCalDay(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600 font-bold"
              >
                &times; Close
              </button>
            </div>
            
            {/* Show Exams */}
            {selectedCalDay.exams.length > 0 && (filterType === "exams" || filterType === "both") && (
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Scheduled Exams:</div>
                {selectedCalDay.exams.map((exam) => (
                  <div key={exam.id} className="p-2 rounded border border-blue-100 bg-blue-50/50 text-[11px] space-y-0.5">
                    <div className="font-bold text-gray-800">{exam.course_name}</div>
                    <div className="text-gray-600">{exam.exam_type}term Exam | Room: {exam.room} | Time: {exam.start_time} - {exam.end_time}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Show Calendar Events */}
            {selectedCalDay.events.length > 0 && (filterType === "calendar" || filterType === "both") && (
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Academic Events & Holidays:</div>
                {selectedCalDay.events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 rounded border text-[11px] space-y-0.5 ${
                      event.event_type === "Holiday"
                        ? "bg-red-50 border-red-100 text-red-700"
                        : "bg-green-50 border-green-100 text-green-700"
                    }`}
                  >
                    <div className="font-bold text-gray-850">{event.title}</div>
                    {event.description && <div className="text-gray-600">{event.description}</div>}
                    <div className="text-[9px] flex justify-between pt-1 border-t border-gray-100">
                      <span className="uppercase font-bold">Type: {event.event_type}</span>
                      <span>Ends: {new Date(event.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {((filterType === "exams" && selectedCalDay.exams.length === 0) ||
              (filterType === "calendar" && selectedCalDay.events.length === 0) ||
              (selectedCalDay.exams.length === 0 && selectedCalDay.events.length === 0)) && (
              <p className="text-[10px] text-gray-400 italic">No scheduled events or exams.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Tab button
  const tabButton = (key, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 border-b-2 ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent"}`}
    >
      {label}
    </button>
  );

  // Button styles
  const btnBase = "px-3 py-1 rounded border";
  const btnActivePresent = "bg-green-600 text-white border-green-600";
  const btnInactivePresent = "bg-white text-green-700 border-green-600";
  const btnActiveAbsent = "bg-red-600 text-white border-red-600";
  const btnInactiveAbsent = "bg-white text-red-700 border-red-600";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto ">
        <h2 className="text-2xl font-bold mb-4">{lang === "en" ? "Teacher Dashboard" : "शिक्षक डैशबोर्ड"}</h2>
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6 flex-wrap">
          {tabButton("attendance", lang === "en" ? "Attendance" : "उपस्थिति")}
          {tabButton("marks", lang === "en" ? "Marks" : "अंक")}
          {tabButton("courses", lang === "en" ? "Courses" : "पाठ्यक्रम")}
          {tabButton("enrollments", lang === "en" ? "Enrollments" : "नामांकन")}
          {tabButton("announcements", lang === "en" ? "Announcements" : "घोषणाएँ")}
          {tabButton("at-risk", lang === "en" ? "At-Risk Alerts" : "जोखिम अलर्ट")}
          {tabButton("issues", lang === "en" ? "Issues" : "मुद्दे")}
          {tabButton("timetable", lang === "en" ? "Timetable" : "समय-सारणी")}
          {tabButton("assignments", lang === "en" ? "Assignments" : "असाइनमेंट")}
          {tabButton("exams", lang === "en" ? "Exams" : "परीक्षा")}
          {tabButton("calendar", lang === "en" ? "Calendar" : "कैलेंडर")}
        </div>

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Attendance Management</h2>
            {/* Record Attendance */}
            <div className="p-4 rounded mb-6" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Mark Attendance</h3>
              <p className="text-sm text-gray-600 mb-2">
                Select a course and date, then mark each student as present or absent.
              </p>

              <div className="flex gap-3 mb-3">
                <select
                  className="border p-2 rounded w-1/3"
                  value={selectedCourse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourse(val);
                    const course = courses.find((c) => String(c.id) === String(val));
                    if (course?.semester !== undefined && course?.semester !== null) {
                      setAttendanceSemester(String(course.semester));
                    }
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border p-2 rounded w-28"
                  placeholder="Semester"
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                />
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Students list */}
              {students.length > 0 && (
                <div className="border rounded mb-4 overflow-x-auto">
                  <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 rounded border bg-green-600 text-white border-green-600"
                        onClick={() => {
                          const next = {}; students.forEach(s => { next[s.id] = "present"; }); setAttendance(next);
                        }}
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded border bg-red-600 text-white border-red-600"
                        onClick={() => {
                          const next = {}; students.forEach(s => { next[s.id] = "absent"; }); setAttendance(next);
                        }}
                      >
                        Mark All Absent
                      </button>
                    </div>
                    <div className="text-sm text-gray-700">
                      {(() => {
                        const present = students.filter(s => attendance[s.id] === "present").length;
                        const total = students.length;
                        return `${present} / ${total} present`;
                      })()}
                    </div>
                  </div>
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Email</th>
                        <th className="border p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="border p-2">{s.id}</td>
                          <td className="border p-2">{s.name}</td>
                          <td className="border p-2">{s.email}</td>
                          <td className="border p-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className={`${btnBase} ${attendance[s.id] === "present" ? btnActivePresent : btnInactivePresent}`}
                                onClick={() => setStatus(s.id, "present")}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`${btnBase} ${attendance[s.id] === "absent" ? btnActiveAbsent : btnInactiveAbsent}`}
                                onClick={() => setStatus(s.id, "absent")}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                className={`px-4 py-2 text-white rounded ${savingAttendance ? "bg-blue-300" : "bg-blue-600"}`}
                onClick={handleSubmitAttendance}
                disabled={savingAttendance}
              >
                {savingAttendance ? "Saving..." : "Record Attendance"}
              </button>
            </div>

            {/* Smart QR Attendance Panel */}
            <div className="p-5 rounded-xl mb-6 shadow-sm border border-slate-200" style={{ backgroundColor: "#F7F7F5" }}>
              <style>{`
                @keyframes scan-glow {
                  0%, 100% { top: 0%; opacity: 0.8; }
                  50% { top: 100%; opacity: 0.3; }
                }
                @keyframes pulse-radar {
                  0% { transform: scale(0.95); opacity: 0.4; }
                  50% { transform: scale(1.08); opacity: 0.8; }
                  100% { transform: scale(0.95); opacity: 0.4; }
                }
                .laser-line {
                  animation: scan-glow 2.5s linear infinite;
                }
                .pulse-radar-dot {
                  animation: pulse-radar 2s ease-in-out infinite;
                }
              `}</style>

              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>🤖</span> 
                    {lang === "en" ? "Smart QR Attendance Session" : "स्मार्ट क्यूआर उपस्थिति सत्र"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === "en" 
                      ? "Create a temporary QR code session that students can scan to instantly log attendance as present." 
                      : "एक अस्थायी क्यूआर कोड सत्र बनाएं जिसे छात्र अपनी उपस्थिति तुरंत दर्ज करने के लिए स्कैन कर सकते हैं।"}
                  </p>
                </div>
                {activeQRSession && (
                  <span className="flex items-center gap-1 bg-green-150 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200 pulse-radar-dot">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {lang === "en" ? "Active" : "सक्रिय"}
                  </span>
                )}
              </div>

              {qrMessage && (
                <div className={`p-3 rounded-lg mb-4 text-xs font-semibold border ${
                  qrSuccess 
                    ? "bg-green-55 text-green-700 border-green-200" 
                    : "bg-red-55 text-red-700 border-red-200"
                }`}>
                  {qrMessage}
                </div>
              )}

              {!activeQRSession ? (
                <form onSubmit={handleCreateQRSession} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {lang === "en" ? "Select Course" : "पाठ्यक्रम चुनें"} *
                      </label>
                      <select
                        className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-sm"
                        value={qrCourseId}
                        onChange={(e) => setQrCourseId(e.target.value)}
                        required
                      >
                        <option value="">{lang === "en" ? "Select Course" : "पाठ्यक्रम चुनें"}</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Sem {c.semester})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {lang === "en" ? "Session Duration (Minutes)" : "सत्र की अवधि (मिनट)"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-sm"
                        value={qrDuration}
                        onChange={(e) => setQrDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-all"
                  >
                    {lang === "en" ? "Generate Attendance QR Code" : "उपस्थिति क्यूआर कोड जनरेट करें"}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: QR Code Visualizer */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-250 bg-white relative overflow-hidden shadow-inner">
                    {/* Pulsing scanner overlay */}
                    <div className="absolute inset-x-0 w-full h-0.5 bg-red-500 laser-line shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10"></div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-3 relative">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${activeQRSession.session_token}&size=250x250`}
                        alt="Attendance QR Code"
                        className="w-48 h-48 block"
                      />
                    </div>

                    <div className="w-full text-center space-y-1.5">
                      <div className="text-xs font-bold text-gray-550 uppercase tracking-wider">
                        {lang === "en" ? "Session Token" : "सत्र टोकन"}
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-bold text-gray-800 break-all select-all">
                          {activeQRSession.session_token}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeQRSession.session_token);
                            const prevMsg = qrMessage;
                            setQrMessage(lang === "en" ? "Token copied to clipboard!" : "टोकन क्लिपबोर्ड पर कॉपी किया गया!");
                            setQrSuccess(true);
                            setTimeout(() => setQrMessage(prevMsg), 2500);
                          }}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-[10px] font-bold rounded text-gray-600 active:scale-95 transition-all"
                        >
                          {lang === "en" ? "Copy" : "कॉपी"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Timer & Scans list */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-550 font-semibold">
                          {lang === "en" ? "Time Remaining" : "शेष समय"}
                        </div>
                        <div className="text-2xl font-black text-gray-805 font-mono mt-1">
                          {(() => {
                            const minutes = Math.floor(qrSecondsRemaining / 60);
                            const seconds = qrSecondsRemaining % 60;
                            return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
                          })()}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleStopQRSession}
                        className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                      >
                        {lang === "en" ? "Stop Session" : "सत्र समाप्त करें"}
                      </button>
                    </div>

                    <div className="flex-1 p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col min-h-[160px]">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👥</span>
                          {lang === "en" ? "Scanned Students" : "स्कैन किए गए छात्र"}{" "}
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-[10px]">
                            {qrScannedStudents.length}
                          </span>
                        </h4>
                        {qrSecondsRemaining > 0 && (
                          <span className="text-[10px] text-gray-400 animate-pulse">
                            ● {lang === "en" ? "Live syncing..." : "लाइव समन्वयन..."}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-40 space-y-2 pr-1">
                        {qrScannedStudents.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 pulse-radar-dot mb-2"></span>
                            <p className="text-xs text-gray-400">
                              {lang === "en" ? "Waiting for student scans..." : "छात्र स्कैन की प्रतीक्षा की जा रही है..."}
                            </p>
                          </div>
                        ) : (
                          qrScannedStudents.map((s, idx) => (
                            <div
                              key={s.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-150 hover:bg-gray-100 transition-all"
                            >
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black">
                                {s.name ? s.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{s.name}</p>
                                <p className="text-[10px] text-gray-505 truncate">{s.email}</p>
                              </div>
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                                {lang === "en" ? "Present" : "उपस्थित"}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Summary */}
            <div className="p-4 rounded mb-6" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">📘 Course-wise Attendance Summary</h3>

              <div className="flex gap-3 mb-3">
                <select
                  className="border p-2 rounded w-1/3"
                  value={selectedCourseSummary}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourseSummary(val);
                    const course = courses.find((c) => String(c.id) === String(val));
                    if (course?.semester !== undefined && course?.semester !== null) {
                      setAttendanceSemester(String(course.semester));
                    }
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border p-2 rounded w-28"
                  placeholder="Semester"
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={async () => {
                    if (!selectedCourseSummary || !attendanceSemester) { setMessage("Select course and semester"); return; }
                    const data = await apiTeacher.getCourseAttendanceSummary({
                      course_id: Number(selectedCourseSummary),
                      semester: Number(attendanceSemester),
                    });
                    setCourseSummary(data);
                  }}
                >
                  Load Summary
                </button>
                {selectedCourseSummary && attendanceSemester && (
                  <a
                    href={`${BASE_URL}/teacher/courses/${selectedCourseSummary}/attendance/export?semester=${attendanceSemester}`}
                    download
                    className="px-4 py-2 bg-green-650 hover:bg-green-700 text-white rounded font-bold text-sm flex items-center justify-center cursor-pointer"
                  >
                    Export Attendance CSV
                  </a>
                )}
              </div>

              {courseSummary.length > 0 && (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Student</th>
                      <th className="border p-2 text-left">Present</th>
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-left">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseSummary.map((row) => (
                      <tr key={row.student_id} className="hover:bg-gray-50">
                        <td className="border p-2">{row.name}</td>
                        <td className="border p-2">{row.present}</td>
                        <td className="border p-2">{row.total}</td>
                        <td className="border p-2">{row.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Overall Summary */}
            <div className="p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">📊 Overall Attendance (All Courses)</h3>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-700">Semester:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setAttendanceSemester(String(sem))}
                    className={`px-2 py-1 rounded border ${String(sem) === String(attendanceSemester)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-blue-700 border-blue-600"
                      }`}
                  >
                    {sem}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  className="border p-2 rounded w-24 ml-2"
                  placeholder="Custom"
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                />
              </div>

              <button
                className="px-4 py-2 bg-purple-600 text-white rounded mb-4"
                onClick={async () => {
                  if (!attendanceSemester) {
                    setMessage("Enter semester to load overall summary");
                    return;
                  }
                  setMessage("");
                  try {
                    const data = await apiTeacher.getTeacherOverallAttendanceSummary({
                      teacher_id: user.id,
                      semester: Number(attendanceSemester),
                    });
                    setOverallSummary(Array.isArray(data) ? data : []);
                    if (!data || data.length === 0) {
                      setMessage("No data found for this semester.");
                    }
                  } catch (err) {
                    setOverallSummary([]);
                    setMessage(err.message || "Failed to load overall summary");
                  }
                }}
              >
                Load Overall Summary
              </button>

              {overallSummary.length > 0 && (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Student</th>
                      <th className="border p-2 text-left">Present</th>
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-left">Overall %</th>
                    </tr>
                  </thead>

                  <tbody>
                    {overallSummary.map((row) => (
                      <tr key={row.student_id} className="hover:bg-gray-50">
                        <td className="border p-2">{row.name}</td>
                        <td className="border p-2">{row.present}</td>
                        <td className="border p-2">{row.total}</td>
                        <td className="border p-2">
                          {row.total > 0 ? ((row.present / row.total) * 100).toFixed(2) : "0.00"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    {(() => {
                      const totalPresent = overallSummary.reduce((acc, r) => acc + (r.present || 0), 0);
                      const totalClasses = overallSummary.reduce((acc, r) => acc + (r.total || 0), 0);
                      const pct =
                        totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : "0.00";
                      return (
                        <tr className="bg-gray-50 font-semibold">
                          <td className="border p-2 text-left">Totals</td>
                          <td className="border p-2">{totalPresent}</td>
                          <td className="border p-2">{totalClasses}</td>
                          <td className="border p-2">{pct}%</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            {/* Create Course */}
            <div className="mb-6  p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Create Course</h3>
              <form onSubmit={handleCreateCourse} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="border p-2 rounded flex-1"
                />
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={courseSemester}
                  onChange={(e) => setCourseSemester(e.target.value)}
                  className="border p-2 rounded w-28"
                  placeholder="Semester"
                  required
                />
                <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Create</button>
              </form>
            </div>

            {/* Course List */}
            <div className="p-4 rounded mb-6" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Your Courses</h3>
              {courses.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Semester</th>
                      <th className="border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="border p-2">{c.id}</td>
                        <td className="border p-2">{c.name}</td>
                        <td className="border p-2">{c.semester}</td>
                        <td className="border p-2">
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to delete course "${c.name}"? This will unenroll all students.`)) return;
                              try {
                                const res = await apiTeacher.deleteCourse(c.id);
                                alert(res.message);
                                const updated = await apiTeacher.getCourses(user.id);
                                setCourses(updated);
                              } catch (err) {
                                console.error(err);
                                alert(err.message || "Failed to delete course");
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await apiTeacher.enrollAllSemesterStudents(c.id);
                                alert(res.message + (res.enrolled !== undefined ? ` (Enrolled: ${res.enrolled})` : ""));
                              } catch (err) {
                                console.error(err);
                                alert(err.message || "Failed to enroll all semester students");
                              }
                            }}
                            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Enroll All (Semester)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No Courses Found.</p>
              )}
            </div>

            {/* Enroll Students */}
            <div className="mb-6  p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Enroll Students</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-1">Course:</label>
                  <select
                    value={enrollCourseId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEnrollCourseId(val);
                      const course = courses.find((c) => String(c.id) === String(val));
                      if (course?.semester !== undefined && course?.semester !== null) {
                        setFilterSemester(String(course.semester));
                      }
                    }}
                    className="border p-2 rounded w-full text-black"
                    style={{ backgroundColor: "white" }}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Semester:</label>
                  <input
                    type="number"
                    min={1}
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Enter semester"
                  />
                </div>
                
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleLoadAvailableStudents}
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                >
                  Load Students
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setMessage("");
                    if (!newStudentEmail || !filterSemester) {
                      setMessage("Enter email and semester for new student");
                      return;
                    }
                    try {
                      const name = newStudentEmail.split('@')[0];
                      await apiTeacher.createStudent({
                        name,
                        email: newStudentEmail,
                        password: "temp123",
                        semester: Number(filterSemester)
                      });
                      setMessage("Student created successfully!");
                      setNewStudentEmail("");
                      await handleLoadAvailableStudents();
                    } catch (err) {
                      setMessage(err.message);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Add New Student
                </button>
              </div>

              {availableStudents.length > 0 && (
                <div>
                  <div className="max-h-56 overflow-auto border rounded mb-3" >
                    {availableStudents.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-2 border-b hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={() => toggleStudentSelect(s.id)}
                        />
                        <span className="flex-1">{s.name} - {s.email}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleEnrollStudents}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={selectedStudentIds.length === 0 || !enrollCourseId}
                  >
                    Enroll Selected Students
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <div>
            {/* Course selector */}
            <div className="mb-4" >
              <label className="mr-2">Select Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCourse(val);
                  const course = courses.find((c) => String(c.id) === String(val));
                  if (course?.semester !== undefined && course?.semester !== null) {
                    setMarksSemester(String(course.semester));
                  }
                }}
                className=" p-2 rounded"
                style={{ backgroundColor: "#F7F7F5" }}
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester + Exam type + Load button */}
            <div className="mb-4 flex gap-4 items-center">
              <div>
                <label className="mr-2" >Semester:</label>
                <input
                  type="number"
                  min={1}
                  value={marksSemester}
                  onChange={(e) => setMarksSemester(e.target.value)}
                  className=" p-2 rounded w-28"
                  style={{ backgroundColor: "#F7F7F5" }}
                />
              </div>
              <div>
                <label className="mr-2">Exam:</label>
                <select
                  style={{ backgroundColor: "#F7F7F5" }}
                  value={marksExamType}
                  onChange={(e) => setMarksExamType(e.target.value)}
                  className=" p-2 rounded"
                >
                  <option value="mid">Mid Term</option>
                  <option value="end">End Term</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleLoadStudents}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Load Students
              </button>
            </div>

            {/* Students table */}
            {students.length > 0 && (
              <div className="border rounded overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100" >
                    <tr>
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Email</th>
                      <th className="border p-2 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="border p-2">{s.id}</td>
                        <td className="border p-2">{s.name}</td>
                        <td className="border p-2">{s.email}</td>
                        <td className="border p-2">
                          <input
                            type="number"
                            placeholder="Marks"
                            value={marksByStudent[s.id] ?? ""}
                            onChange={(e) => setMarks(s.id, e.target.value)}
                            className="border p-2 rounded w-24"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save, Export, and Import buttons */}
            {students.length > 0 && (
              <div className="flex flex-wrap gap-4 items-center mt-4">
                <button
                  onClick={handleSubmitMarks}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save Marks
                </button>
                <a
                  href={`${BASE_URL}/teacher/courses/${selectedCourse}/grades/export?semester=${marksSemester}&exam_type=${marksExamType}`}
                  download
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  Export CSV Template
                </a>
                <div className="border-l border-gray-300 pl-4 flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500">Import CSV:</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setMessage("");
                      try {
                        const res = await apiTeacher.importGradesCSV({
                          course_id: Number(selectedCourse),
                          semester: Number(marksSemester),
                          exam_type: marksExamType,
                          file
                        });
                        setMessage(`✅ ${res.message || "Grades imported successfully!"}`);
                        handleLoadStudents();
                      } catch (err) {
                        setMessage(`❌ ${err.message || "Failed to import CSV"}`);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === "enrollments" && (
          <div>
            <div className="mb-6  p-4 rounded">
              <h3 className="font-semibold mb-2" >Get Student Records</h3>

              <div className=" rounded p-3" style={{ backgroundColor: "#F7F7F5" }}>
                <div className="flex flex-wrap gap-2 items-end mb-3">
                  <div>
                    <label className="mr-2">Course:</label>
                    <select
                      className="border p-2 rounded"
                      value={enrollmentsCourseId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEnrollmentsCourseId(val);
                        const course = courses.find((c) => String(c.id) === String(val));
                        if (course?.semester !== undefined && course?.semester !== null) {
                          setEnrollmentsSemester(String(course.semester));
                        }
                      }}
                    >
                      <option value="" className="text-black">
                        -- Select Course --
                      </option>
                      {courses.map((c) => (
                        <option className="text-black" key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mr-2">Semester:</label>
                    <input
                      type="number"
                      className="border p-2 rounded w-28"
                      value={enrollmentsSemester}
                      onChange={(e) => setEnrollmentsSemester(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadEnrollments}
                    className="px-3 py-2 bg-blue-600 text-white rounded"
                  >
                    Load
                  </button>
                </div>

                {/* Table */}
                {enrollments.length > 0 ? (
                  <table className="w-full border-collapse ">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="border p-2">{s.id}</td>
                          <td className="border p-2">{s.name}</td>
                          <td className="border p-2">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No students found for this course & semester.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === "issues" && (
          <div>
            <div className="p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Student Raised Issues</h3>
              
              <div className="mb-4">
                <button 
                  onClick={fetchIssues} 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Refresh Issues
                </button>
              </div>
              
              {issues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Student Name</th>
                        <th className="border p-2 text-left">Student Email</th>
                        <th className="border p-2 text-left">Course</th>
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-left">Reason</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="border p-2">{issue.id}</td>
                          <td className="border p-2">{issue.student_name || issue.student?.name || issue.student_id}</td>
                          <td className="border p-2">{issue.student_email || issue.student?.email || "-"}</td>
                          <td className="border p-2">{issue.course_name || issue.course?.name || issue.course_id}</td>
                          <td className="border p-2">{new Date(issue.created_at).toLocaleDateString()}</td>
                          <td className="border p-2">{issue.remark}</td>
                          <td className="border p-2">
                            <span 
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                issue.status === "Approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : issue.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="border p-2">
                            {issue.status === "Pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setIssueId(issue.id);
                                    setIssueStatus("Approved");
                                    setIssueRemark("");
                                  }}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setIssueId(issue.id);
                                    setIssueStatus("Rejected");
                                    setIssueRemark("");
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No issues to display.</p>
              )}
              
              {/* Resolve Issue Form */}
              {issueId && (
                <div className="mt-6 p-4 border rounded bg-white">
                  <h4 className="font-semibold mb-2">
                    {issueStatus === "Approved" ? "Approve" : "Reject"} Issue #{issueId}
                  </h4>
                  <form onSubmit={handleResolveIssue} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remark (Optional)
                      </label>
                      <textarea
                        value={issueRemark}
                        onChange={(e) => setIssueRemark(e.target.value)}
                        className="border p-2 rounded w-full h-24"
                        placeholder="Add a message for the student"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className={`px-4 py-2 text-white rounded ${
                          issueStatus === "Approved" ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {issueStatus === "Approved" ? "Approve" : "Reject"} Issue
                      </button>
                      <button
                        type="button"
                        onClick={() => setIssueId("")}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            {/* Create Announcement */}
            <div className="p-5 rounded bg-gray-50 border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Post Announcement</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Course (Optional):</label>
                    <select
                      value={annCourseId}
                      onChange={(e) => setAnnCourseId(e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">All Courses (Broadcast)</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title:</label>
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      required
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Content:</label>
                  <textarea
                    placeholder="Write the announcement body here..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    required
                    className="border p-2 rounded w-full h-32 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
                >
                  Post Announcement
                </button>
              </form>
            </div>

            {/* List Announcements */}
            <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-850">Your Announcements</h3>
              {teacherAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {teacherAnnouncements.map((a) => (
                    <div key={a.id} className="p-4 rounded border border-gray-100 bg-gray-50 space-y-2 hover:bg-gray-100/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-bold text-gray-800">{a.title}</h4>
                          <p className="text-xs text-blue-600 font-semibold">{a.course_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</span>
                          <button
                            onClick={() => handleDeleteAnnouncement(a.id)}
                            className="text-red-650 hover:text-red-500 text-xs font-bold cursor-pointer transition-all border-0 bg-transparent"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-650 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No announcements posted yet.</p>
              )}
            </div>
          </div>
        )}

        {/* At-Risk Alerts Tab */}
        {activeTab === "at-risk" && (
          <div className="space-y-6">
            <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">⚠️ At-Risk Student Alerts</h3>
                  <p className="text-xs text-gray-500">Students with overall attendance &lt; 75% or any grade &lt; 40 in exams</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Semester:</span>
                  <select
                    value={atRiskSemester}
                    onChange={(e) => setAtRiskSemester(e.target.value)}
                    className="border p-1.5 rounded text-xs min-w-[70px]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {atRiskStudents.length > 0 ? (
                <div className="space-y-3">
                  {atRiskStudents.map((student) => (
                    <div key={student.student_id} className="p-4 rounded border border-red-200 bg-red-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="font-bold text-red-900">{student.name} <span className="text-xs text-red-700 font-normal">#{student.student_id}</span></div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {student.reasons.map((r, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 text-xs font-semibold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCourseSummary("");
                          setAttendanceSemester(String(atRiskSemester));
                          setActiveTab("attendance");
                        }}
                        className="px-3.5 py-1.5 bg-red-700 hover:bg-red-650 text-white rounded text-xs font-bold transition-all active:scale-95 border-0 cursor-pointer"
                      >
                        Review Attendance
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No at-risk students flagged for semester {atRiskSemester}.</p>
              )}
            </div>
          </div>
        )}

        {/* Timetable Tab */}
        {activeTab === "timetable" && (
          <div className="space-y-6">
            {/* Create Schedule Slot */}
            <div className="p-5 rounded border bg-gray-50 border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Schedule Course Class Slot</h3>
              <form onSubmit={handleCreateTimetable} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Course:</label>
                  <select
                    value={scheduleCourseId}
                    onChange={(e) => setScheduleCourseId(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Day of Week:</label>
                  <select
                    value={scheduleDay}
                    onChange={(e) => setScheduleDay(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Room Hall:</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 402"
                    value={scheduleRoom}
                    onChange={(e) => setScheduleRoom(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time:</label>
                  <input
                    type="time"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Time:</label>
                  <input
                    type="time"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
                  >
                    Add Slot
                  </button>
                </div>
              </form>
            </div>

            {/* Timetable Grid View */}
            <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Weekly Schedule Slots</h3>
              {timetable.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                    const daySlots = timetable.filter(s => s.day_of_week === day);
                    return (
                      <div key={day} className="p-3 rounded border bg-gray-50 border-gray-200 space-y-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase border-b pb-1.5">{day}</h4>
                        {daySlots.length > 0 ? (
                          <div className="space-y-2">
                            {daySlots.map((slot) => (
                              <div key={slot.id} className="p-2.5 rounded bg-white border border-gray-150 space-y-1.5 hover:shadow-sm transition-all relative group">
                                <p className="font-semibold text-gray-800 text-xs">{slot.course_name}</p>
                                <p className="text-[10px] text-gray-500">{slot.start_time} - {slot.end_time}</p>
                                <p className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded inline-block">Room: {slot.room}</p>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTimetable(slot.id)}
                                  className="w-full text-center text-red-650 hover:text-red-500 text-[10px] font-bold mt-2 pt-1 border-t border-gray-100 block cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic py-2 text-center">No classes</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No class schedule timetable slots recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            {/* Create Assignment Form */}
            <div className="p-5 rounded border bg-gray-50 border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Create Course Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Course:</label>
                    <select
                      value={assCourseId}
                      onChange={(e) => setAssCourseId(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Assignment Title:</label>
                    <input
                      type="text"
                      placeholder="e.g. Midterm Essay"
                      value={assTitle}
                      onChange={(e) => setAssTitle(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date:</label>
                    <input
                      type="date"
                      value={assDueDate}
                      onChange={(e) => setAssDueDate(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description:</label>
                    <input
                      type="text"
                      placeholder="Enter description, instructions or files link..."
                      value={assDesc}
                      onChange={(e) => setAssDesc(e.target.value)}
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Max Marks:</label>
                    <input
                      type="number"
                      value={assMaxMarks}
                      onChange={(e) => setAssMaxMarks(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
                >
                  Create Assignment
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignment list */}
              <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Assignments List</h3>
                {teacherAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {teacherAssignments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleViewSubmissions(a.id)}
                        className={`p-4 rounded border cursor-pointer hover:bg-gray-50/50 transition-all ${
                          selectedAssignmentId === a.id ? "border-blue-500 bg-blue-50/20" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-800">{a.title}</h4>
                            <p className="text-xs text-blue-600 font-semibold">{a.course_name}</p>
                          </div>
                          <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border text-gray-600">
                            Max: {a.max_marks} marks
                          </span>
                        </div>
                        {a.description && <p className="text-xs text-gray-500 mt-2">{a.description}</p>}
                        <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex justify-between">
                          <span>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No date"}</span>
                          <span className="text-blue-600 font-bold hover:underline">Click to view submissions &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No assignments created yet.</p>
                )}
              </div>

              {/* Submissions list / grading */}
              <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">
                  Submissions {selectedAssignmentId && `(Assignment #${selectedAssignmentId})`}
                </h3>
                {selectedAssignmentId ? (
                  submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="p-4 rounded border border-gray-100 bg-gray-50 space-y-3 text-sm">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <div className="font-bold text-gray-800">{sub.student_name}</div>
                              <div className="text-xs text-gray-500">{sub.student_email}</div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              sub.status === "Graded" ? "bg-green-100 text-green-800 border border-green-200" :
                              "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="p-3 rounded bg-white border border-gray-100 text-xs font-mono text-gray-700 whitespace-pre-wrap">
                            {sub.submission_text}
                          </div>
                          {sub.status === "Graded" ? (
                            <div className="p-2.5 rounded bg-green-50 border border-green-150 text-xs">
                              <div className="font-bold text-green-800">Grade: {sub.marks_obtained} marks</div>
                              {sub.feedback && <div className="text-gray-600 mt-1">Feedback: "{sub.feedback}"</div>}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setGradingSubmissionId(sub.id);
                                setGradingMarks("");
                                setGradingFeedback("");
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold cursor-pointer"
                            >
                              Grade / Add Feedback
                            </button>
                          )}

                          {gradingSubmissionId === sub.id && (
                            <form onSubmit={handleGradeSubmission} className="p-3.5 border rounded bg-white space-y-3">
                              <h4 className="font-bold text-gray-800 text-xs">Grade Submission #{sub.id}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Marks Obtained:</label>
                                  <input
                                    type="number"
                                    placeholder="Marks obtained"
                                    value={gradingMarks}
                                    onChange={(e) => setGradingMarks(e.target.value)}
                                    required
                                    className="border p-1.5 rounded w-full text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Feedback:</label>
                                  <input
                                    type="text"
                                    placeholder="Feedback details..."
                                    value={gradingFeedback}
                                    onChange={(e) => setGradingFeedback(e.target.value)}
                                    className="border p-1.5 rounded w-full text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button type="submit" className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">
                                  Save Grade
                                </button>
                                <button type="button" onClick={() => setGradingSubmissionId("")} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No student submissions found for this assignment.</p>
                  )
                ) : (
                  <p className="text-gray-400 text-sm italic">Select an assignment from the left to view submissions.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            {/* Schedule Exam Form */}
            <div className="p-5 rounded border bg-gray-50 border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Schedule Course Exam</h3>
              <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Course:</label>
                  <select
                    value={examCourseId}
                    onChange={(e) => setExamCourseId(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Exam Type:</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  >
                    <option value="mid">Mid Term</option>
                    <option value="end">End Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Room Hall:</label>
                  <input
                    type="text"
                    placeholder="e.g. Audi 2"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Exam Date:</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time:</label>
                  <input
                    type="time"
                    value={examStart}
                    onChange={(e) => setExamStart(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Time:</label>
                  <input
                    type="time"
                    value={examEnd}
                    onChange={(e) => setExamEnd(e.target.value)}
                    required
                    className="border p-2 rounded w-full bg-white"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
                  >
                    Schedule Exam
                  </button>
                </div>
              </form>
            </div>

            {/* Visual Calendar View */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800 text-md">Visual Month Calendar (Exams highlighted)</h4>
              {renderMonthlyCalendarGrid("exams")}
            </div>

            {/* Exams Scheduled List */}
            <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Scheduled Exams List</h3>
              {exams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exams.map((exam) => {
                    const examDateObj = new Date(exam.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const diffTime = examDateObj - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const countdownText = diffDays > 0 
                      ? `⏳ ${diffDays} day(s) remaining` 
                      : diffDays === 0 
                      ? "🚨 TODAY!" 
                      : "Completed";

                    return (
                      <div key={exam.id} className="p-4 rounded-xl border border-gray-150 bg-gray-50 flex flex-col justify-between gap-4 hover:shadow-sm transition-all">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-bold text-gray-800">{exam.course_name}</h4>
                              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{exam.exam_type}term Exam</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              diffDays > 0 ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              diffDays === 0 ? "bg-red-100 text-red-800 border border-red-200" :
                              "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}>
                              {countdownText}
                            </span>
                          </div>
                          <div className="mt-4 space-y-1 text-xs text-gray-600">
                            <div>📅 Date: <span className="font-semibold text-gray-850">{new Date(exam.date).toLocaleDateString()}</span></div>
                            <div>🕒 Time: <span className="font-semibold text-gray-850">{exam.start_time} - {exam.end_time}</span></div>
                            <div>🏫 Room: <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1">Hall: {exam.room}</span></div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExam(exam.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold cursor-pointer self-start"
                        >
                          Delete Schedule
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No scheduled exams yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Create Calendar Event Form */}
            <div className="p-5 rounded bg-gray-50 border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Create Academic Calendar Event</h3>
              <form onSubmit={handleCreateCalendarEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Event Title:</label>
                    <input
                      type="text"
                      placeholder="e.g. Winter Break"
                      value={calTitle}
                      onChange={(e) => setCalTitle(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date:</label>
                    <input
                      type="date"
                      value={calStart}
                      onChange={(e) => setCalStart(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">End Date:</label>
                    <input
                      type="date"
                      value={calEnd}
                      onChange={(e) => setCalEnd(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description:</label>
                    <input
                      type="text"
                      placeholder="Details about the event..."
                      value={calDesc}
                      onChange={(e) => setCalDesc(e.target.value)}
                      className="border p-2 rounded w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Event Type:</label>
                    <select
                      value={calType}
                      onChange={(e) => setCalType(e.target.value)}
                      required
                      className="border p-2 rounded w-full bg-white"
                    >
                      <option value="Event">Event</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
                >
                  Create Event
                </button>
              </form>
            </div>

            {/* Visual Calendar View */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800 text-md">Visual Month Calendar (Academic events & holidays highlighted)</h4>
              {renderMonthlyCalendarGrid("calendar")}
            </div>

            {/* Calendar Events List */}
            <div className="p-5 rounded bg-white border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Academic Calendar Events</h3>
              {calendarEvents.length > 0 ? (
                <div className="space-y-3">
                  {calendarEvents.map((event) => {
                    const isHoliday = event.event_type === "Holiday";
                    return (
                      <div key={event.id} className="p-4 rounded-xl border border-gray-150 bg-gray-50 flex items-start justify-between gap-4 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg font-black text-center text-xs uppercase min-w-[65px] ${
                            isHoliday 
                              ? "bg-red-100 text-red-705 border border-red-200" 
                              : "bg-blue-100 text-blue-705 border border-blue-200"
                          }`}>
                            <div>{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className="text-md">{new Date(event.start_date).getDate()}</div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-850">{event.title}</h4>
                            {event.description && <p className="text-xs text-gray-500">{event.description}</p>}
                            <div className="text-[10px] text-gray-400">Type: <span className="font-semibold">{event.event_type}</span></div>
                            <div className="text-[10px] text-gray-400">Ends: <span className="font-semibold">{new Date(event.end_date).toLocaleDateString()}</span></div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCalendarEvent(event.id)}
                          className="px-2 py-1 bg-red-650 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No events in the calendar yet.</p>
              )}
            </div>
          </div>
        )}

        {message && <p className="mt-4 text-green-600">{message}</p>}

        {/* Onboarding Tour Overlay */}
        {tourStep !== null && tourSteps[tourStep] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
            <div 
              style={tourSteps[tourStep].style}
              className="absolute p-6 w-full max-w-sm glass-panel border-2 border-indigo-500 shadow-2xl text-slate-100 rounded-2xl animate-in zoom-in-95 duration-200 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  {lang === 'en' ? `Step ${tourStep + 1} of ${tourSteps.length}` : `चरण ${tourStep + 1} का ${tourSteps.length}`}
                </span>
                <button onClick={handleSkipTour} className="text-xs text-slate-500 hover:text-slate-300 font-medium">
                  {lang === 'en' ? 'Skip' : 'छोड़ें'}
                </button>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{tourSteps[tourStep].title}</h4>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">{tourSteps[tourStep].content}</p>
              <div className="flex justify-between items-center">
                <button 
                  onClick={handleSkipTour}
                  className="text-xs text-rose-400 hover:underline font-bold"
                >
                  {lang === 'en' ? 'End Tour' : 'टूर समाप्त करें'}
                </button>
                <button 
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                >
                  {tourStep === tourSteps.length - 1 
                    ? (lang === 'en' ? 'Finish' : 'समाप्त करें') 
                    : (lang === 'en' ? 'Next →' : 'आगे →')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;