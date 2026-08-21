import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiStudent, BASE_URL } from "../api";
import DashboardLayout from "../DashboardLayout";
import AttendanceHeatmap from "../components/AttendanceHeatmap";
import { Html5Qrcode } from "html5-qrcode";

// MUI icons
import AssessmentIcon from "@mui/icons-material/Assessment";
import BookIcon from "@mui/icons-material/Book";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradeIcon from "@mui/icons-material/Grade";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PsychologyIcon from "@mui/icons-material/Psychology";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SettingsIcon from "@mui/icons-material/Settings";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// Recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const tt = {
  en: {
    studentDashboard: "Student Dashboard",
    overallAttendance: "Overall Attendance",
    activeCourses: "Active Courses",
    averageScore: "Average Score",
    issuesRaised: "Issues Raised",
    overview: "Overview",
    timetable: "Timetable",
    attendanceDetail: "Attendance Detail",
    gradesDetail: "Grades Detail",
    announcements: "Announcements",
    assignments: "Assignments",
    exams: "Exams",
    calendar: "Calendar",
    raiseIssue: "Raise Issue",
    customizeWidgets: "Customize Widgets",
    dragHeaders: "(Drag widgets to reorder, toggle checkboxes to show/hide)",
    resetLayout: "Reset Layout",
    hide: "Hide",
    noData: "No data available",
    recentIssues: "Recent Issues",
    course: "Course",
    date: "Date",
    status: "Status",
    noIssues: "No issues raised yet.",
    attendanceHeatmap: "Attendance Heatmap",
    overallAttendanceSummary: "Overall Attendance Summary",
    checkAttendanceMonth: "Check Attendance by Month",
    semester: "Semester",
    activeTabDashboard: "Overview",
    activeTabTimetable: "Timetable",
    activeTabAttendance: "Attendance Detail",
    activeTabGrades: "Grades Detail",
    activeTabAnnouncements: "Announcements",
    activeTabAssignments: "Assignments",
    activeTabExams: "Exams",
    activeTabCalendar: "Calendar",
    activeTabIssue: "Raise Issue",
    activeTabInsights: "Smart Insights",
    activeTabScanQR: "Smart Attendance"
  },
  hi: {
    studentDashboard: "छात्र डैशबोर्ड",
    overallAttendance: "कुल उपस्थिति",
    activeCourses: "सक्रिय पाठ्यक्रम",
    averageScore: "औसत अंक",
    issuesRaised: "उठाए गए मुद्दे",
    overview: "अवलोकन",
    timetable: "समय-सारणी",
    attendanceDetail: "उपस्थिति विवरण",
    gradesDetail: "ग्रेड विवरण",
    announcements: "घोषणाएँ",
    assignments: "सत्रकार्य",
    exams: "परीक्षाएं",
    calendar: "कैलेंडर",
    raiseIssue: "मुद्दा उठाएं",
    customizeWidgets: "विजेट कस्टमाइज़ करें",
    dragHeaders: "(पुनः व्यवस्थित करने के लिए शीर्षकों को खींचें, दिखाने/छिपाने के लिए स्विच टॉगल करें)",
    resetLayout: "लेआउट रीसेट करें",
    hide: "छिपाएं",
    noData: "कोई डेटा उपलब्ध नहीं है",
    recentIssues: "हाल के मुद्दे",
    course: "पाठ्यक्रम",
    date: "तारीख",
    status: "स्थिति",
    noIssues: "अभी तक कोई मुद्दा नहीं उठाया गया है।",
    attendanceHeatmap: "उपस्थिति हीटमैप",
    overallAttendanceSummary: "कुल उपस्थिति सारांश",
    checkAttendanceMonth: "महीने के अनुसार उपस्थिति जांचें",
    semester: "सेमेस्टर",
    activeTabDashboard: "अवलोकन",
    activeTabTimetable: "समय-सारणी",
    activeTabAttendance: "उपस्थिति विवरण",
    activeTabGrades: "ग्रेड विवरण",
    activeTabAnnouncements: "घोषणाएँ",
    activeTabAssignments: "सत्रकार्य",
    activeTabExams: "परीक्षाएं",
    activeTabCalendar: "कैलेंडर",
    activeTabIssue: "मुद्दा उठाएं",
    activeTabInsights: "स्मार्ट विश्लेषण",
    activeTabScanQR: "स्मार्ट उपस्थिति"
  }
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  // State arrays for dashboard sections
  const [courses, setCourses] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    overall: { present: 0, total: 0, percentage: 0 },
    by_course: [],
  });
  const [studentIssues, setStudentIssues] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [smartInsights, setSmartInsights] = useState(null);

  // Status/Messages
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsMsg, setInsightsMsg] = useState("");
  const [message, setMessage] = useState("");

  // Raise issue tab state
  const [issueCourseId, setIssueCourseId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issueReason, setIssueReason] = useState("");

  // Attendance by month state
  const [attendanceCheckCourseId, setAttendanceCheckCourseId] = useState("");
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth() + 1);
  const [attendanceByMonthResult, setAttendanceByMonthResult] = useState([]);

  // Assignment submit state
  const [activeAssignmentId, setActiveAssignmentId] = useState("");
  const [submissionText, setSubmissionText] = useState("");

  // Grades configurations
  const [showMid, setShowMid] = useState(true);
  const [showEnd, setShowEnd] = useState(true);
  const [gradesSemester, setGradesSemester] = useState(user?.semester ?? "");

  // QR Attendance scanning states
  const [qrToken, setQrToken] = useState("");
  const [qrMsg, setQrMsg] = useState("");
  const [qrSuccess, setQrSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const scannerRef = useRef(null);

  // Sync translation lang
  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "en");
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  // Fetch initial profile & overall stats
  useEffect(() => {
    if (!user) return;
    const fetchBaseData = async () => {
      setLoading(true);
      try {
        const coursesData = await apiStudent.getCourses(user.id);
        setCourses(coursesData || []);

        const attData = await apiStudent.getAttendanceSummary(user.id);
        setAttendanceSummary(attData || { overall: { present: 0, total: 0, percentage: 0 }, by_course: [] });

        const issuesData = await apiStudent.getStudentIssues(user.id);
        setStudentIssues(issuesData || []);

        const heatmap = await apiStudent.getAttendanceHeatmap(user.id);
        setHeatmapData(heatmap || []);

        const anns = await apiStudent.getAnnouncements(user.id);
        setAnnouncements(anns || []);

        const schedule = await apiStudent.getTimetable(user.id);
        setTimetable(schedule || []);

        const homeworks = await apiStudent.getAssignments(user.id);
        setAssignments(homeworks || []);

        const examSchedules = await apiStudent.getExams(user.id);
        setExams(examSchedules || []);

        // Fetch actual calendars via admin endpoints
        try {
          const resEvents = await fetch(`${BASE_URL}/admin/calendar-events`).then(r => r.json());
          setCalendarEvents(resEvents || []);
        } catch (evtErr) {
          console.error("Calendar events fetch error:", evtErr);
        }

        // Fetch grades for initial semester
        const sem = user?.semester || (coursesData && coursesData[0] && coursesData[0].semester);
        if (sem) {
          const gradesData = await apiStudent.getGrades({
            student_id: user.id,
            semester: Number(sem),
            show_mid: true,
            show_end: true
          });
          setGrades(Array.isArray(gradesData) ? gradesData : []);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, [user]);

  // Fetch Smart Insights on demand
  const fetchSmartInsights = async () => {
    setInsightsLoading(true);
    setInsightsMsg("");
    try {
      const data = await apiStudent.getSmartInsights(user.id);
      setSmartInsights(data);
    } catch (err) {
      setInsightsMsg(err.message || "Failed to load predictive insights.");
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "insights") {
      fetchSmartInsights();
    }
  }, [activeTab]);

  // Draggable widgets management
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem("student_widgets");
    return saved ? JSON.parse(saved) : [
      { id: "attendance_chart", title: "Attendance by Course", visible: true },
      { id: "grades_chart", title: "Course Grades", visible: true },
      { id: "recent_issues", title: "Recent Issues", visible: true },
      { id: "attendance_heatmap", title: "Attendance Heatmap", visible: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem("student_widgets", JSON.stringify(widgets));
  }, [widgets]);

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, idx) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    setWidgets((prev) => {
      const next = [...prev];
      const item = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(idx, 0, item);
      setDraggedIndex(idx);
      return next;
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Onboarding Tour logic
  const [tourStep, setTourStep] = useState(null);

  useEffect(() => {
    const tourDone = localStorage.getItem("onboarding_student_done");
    if (!tourDone) {
      setTourStep(0);
    }
  }, []);

  const tourSteps = [
    {
      title: lang === "en" ? "👋 Welcome to AcadTrack Student Dashboard!" : "👋 ऐकडट्रैक छात्र डैशबोर्ड में आपका स्वागत है!",
      content: lang === "en"
        ? "This is your main dashboard. Here you can see your profile info, current semester, and enrollment details."
        : "यह आपका मुख्य डैशबोर्ड है। यहाँ आप अपनी प्रोफ़ाइल जानकारी, वर्तमान सेमेस्टर और नामांकन विवरण देख सकते हैं।",
      style: { top: "180px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === "en" ? "📊 Real-Time Metrics" : "📊 वास्तविक समय संकेतक",
      content: lang === "en"
        ? "Get an instant summary of your attendance percentage, active courses, academic average, and raised issues."
        : "अपनी उपस्थिति प्रतिशत, सक्रिय पाठ्यक्रम, शैक्षणिक औसत और उठाए गए मुद्दों का तुरंत सारांश प्राप्त करें।",
      style: { top: "340px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === "en" ? "📅 Comprehensive Tabs" : "📅 व्यापक टैब",
      content: lang === "en"
        ? "Access your weekly timetable class schedules, exam schedules, assignment countdowns, academic holiday events, and raise attendance dispute issues."
        : "अपनी कक्षा समय-सारणी, परीक्षा कार्यक्रम, असाइनमेंट उल्टी गिनती, शैक्षणिक अवकाश कार्यक्रम का उपयोग करें और उपस्थिति विवाद के मुद्दों को उठाएं।",
      style: { top: "480px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === "en" ? "⚙️ Customizable Layout" : "⚙️ अनुकूलन योग्य लेआउट",
      content: lang === "en"
        ? "Drag the widgets to reorder them to your liking, and toggle checkboxes to show/hide specific charts."
        : "अपनी पसंद के अनुसार विजेट्स को पुनर्गठित करने के लिए खींचें और विशिष्ट चार्ट दिखाने/छिपाने के लिए चेकबॉक्स टॉगल करें।",
      style: { top: "580px", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: lang === "en" ? "🌓 Theme & Language Toggles" : "🌓 थीम और भाषा टॉगल",
      content: lang === "en"
        ? "Toggle between Light and Dark mode, or translate the entire layout into Hindi instantly!"
        : "लाइट और डार्क मोड के बीच टॉगल करें, या तुरंत पूरे लेआउट का हिंदी में अनुवाद करें!",
      style: { top: "90px", right: "20px" }
    }
  ];

  const handleNextStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep((prev) => prev + 1);
    } else {
      setTourStep(null);
      localStorage.setItem("onboarding_student_done", "true");
    }
  };

  const handleSkipTour = () => {
    setTourStep(null);
    localStorage.setItem("onboarding_student_done", "true");
  };

  // Attendance by month handler
  const handleCheckAttendanceByMonth = async () => {
    if (!attendanceCheckCourseId || !attendanceYear || !attendanceMonth) return;
    setMessage("");
    try {
      const data = await apiStudent.getAttendanceByCourseAndMonth({
        student_id: user.id,
        course_id: Number(attendanceCheckCourseId),
        year: Number(attendanceYear),
        month: Number(attendanceMonth)
      });
      setAttendanceByMonthResult(data || []);
    } catch (err) {
      setMessage(err.message || "Failed to load monthly attendance detail.");
    }
  };

  // Load marks handler
  const handleReloadGrades = async () => {
    setMessage("");
    try {
      const sem = Number(gradesSemester || user?.semester || 1);
      const data = await apiStudent.getGrades({
        student_id: user.id,
        semester: sem,
        show_mid: !!showMid,
        show_end: !!showEnd
      });
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message || "Failed to load grades.");
    }
  };

  // Raise issue handler
  const handleRaiseIssueSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiStudent.raiseIssue({
        student_id: user.id,
        course_id: Number(issueCourseId),
        date: issueDate,
        reason: issueReason
      });
      setMessage("✅ Issue raised successfully!");
      setIssueCourseId("");
      setIssueDate("");
      setIssueReason("");
      // Refresh list
      const issuesData = await apiStudent.getStudentIssues(user.id);
      setStudentIssues(issuesData || []);
    } catch (err) {
      setMessage(err.message || "Failed to raise attendance issue.");
    }
  };

  // Submit assignment handler
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiStudent.submitAssignment({
        assignment_id: Number(activeAssignmentId),
        student_id: user.id,
        submission_text: submissionText
      });
      setMessage("✅ Assignment submitted successfully!");
      setSubmissionText("");
      setActiveAssignmentId("");
      // Refresh list
      const homeworks = await apiStudent.getAssignments(user.id);
      setAssignments(homeworks || []);
    } catch (err) {
      setMessage(err.message || "Failed to submit assignment response.");
    }
  };

  // Assignment countdown calculations
  const getRemainingTime = (dueDate, isSubmitted) => {
    if (isSubmitted) return "✓ Submitted";
    const diff = new Date(dueDate) - new Date();
    if (diff <= 0) return "Overdue";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `⏳ ${days}d ${hours}h remaining`;
    if (hours > 0) return `⏳ ${hours}h ${minutes}m remaining`;
    return `⏳ ${minutes}m remaining`;
  };

  // Average marks calculation
  const calculatedAverage = grades.length > 0
    ? (grades.reduce((acc, g) => acc + (g.mid !== null && g.mid !== undefined ? Number(g.mid) : 0) + (g.end !== null && g.end !== undefined ? Number(g.end) : 0), 0) / (grades.length * ( (showMid ? 1 : 0) + (showEnd ? 1 : 0) ) || 1)).toFixed(1)
    : 0;

  // Render navigation tab button
  const renderTabButton = (tabId, labelKey) => (
    <button
      type="button"
      onClick={() => {
        setActiveTab(tabId);
        setMessage("");
      }}
      className={`px-5 py-3 font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
        activeTab === tabId
          ? "border-indigo-500 text-indigo-400 bg-white/5"
          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/2"
      }`}
    >
      {tt[lang][labelKey]}
    </button>
  );

  // Calendar setup
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  const renderCalendarGrid = (tabType) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayOffset = new Date(calendarYear, calendarMonth, 1).getDay();
    
    const cells = [];
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
    
    // Offset previous month
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        month: calendarMonth === 0 ? 11 : calendarMonth - 1,
        year: calendarMonth === 0 ? calendarYear - 1 : calendarYear,
      });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        month: calendarMonth,
        year: calendarYear,
      });
    }
    
    // Next month remaining cells (to make 42 grid blocks)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        month: calendarMonth === 11 ? 0 : calendarMonth + 1,
        year: calendarMonth === 11 ? calendarYear + 1 : calendarYear,
      });
    }
    
    return (
      <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <button
            type="button"
            onClick={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear((y) => y - 1);
              } else {
                setCalendarMonth((m) => m - 1);
              }
              setSelectedDateDetails(null);
            }}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-355 text-xs font-bold transition-all cursor-pointer"
          >
            ← Previous Month
          </button>
          <h4 className="text-lg font-black text-white uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-xl border border-white/5">
            {monthNames[calendarMonth]} {calendarYear}
          </h4>
          <button
            type="button"
            onClick={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear((y) => y + 1);
              } else {
                setCalendarMonth((m) => m + 1);
              }
              setSelectedDateDetails(null);
            }}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-355 text-xs font-bold transition-all cursor-pointer"
          >
            Next Month →
          </button>
        </div>
        
        <div className="grid grid-cols-7 text-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">
          {weekdays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => {
            const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
            const dateExams = exams.filter((ex) => ex.date && ex.date.substring(0, 10) === dateStr);
            const dateEvents = calendarEvents.filter((ev) => ev.start_date && ev.start_date.substring(0, 10) === dateStr);
            
            const hasExams = dateExams.length > 0;
            const hasEvents = dateEvents.length > 0;
            const isSelected = selectedDateDetails && selectedDateDetails.date === dateStr;
            
            return (
              <button
                key={idx}
                type="button"
                disabled={!cell.isCurrentMonth}
                onClick={() => setSelectedDateDetails({ date: dateStr, exams: dateExams, events: dateEvents })}
                className={`p-3 min-h-[70px] rounded-xl border flex flex-col justify-between items-start transition-all relative cursor-pointer ${
                  cell.isCurrentMonth
                    ? isSelected
                      ? "bg-indigo-500/25 border-indigo-500/50"
                      : "bg-white/2 border-white/5 hover:bg-white/8"
                    : "opacity-20 border-transparent bg-transparent cursor-default"
                }`}
              >
                <span className={`text-xs font-black ${cell.isCurrentMonth ? "text-slate-300" : "text-slate-600"}`}>
                  {cell.day}
                </span>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {hasExams && (tabType === "exams" || tabType === "both") && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 border border-indigo-400" title={`${dateExams.length} Exams`} />
                  )}
                  {hasEvents && (tabType === "calendar" || tabType === "both") && (
                    dateEvents.map((ev, sIdx) => {
                      const isHoliday = ev.event_type === "Holiday";
                      return (
                        <span
                          key={sIdx}
                          className={`w-2 h-2 rounded-full border ${isHoliday ? "bg-rose-500 border-rose-450" : "bg-emerald-500 border-emerald-450"}`}
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
        
        {selectedDateDetails && (
          <div className="mt-4 p-5 rounded-xl border border-white/5 bg-slate-950/80 space-y-4 animate-in slide-in-from-top-3 duration-200 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h5 className="font-black text-indigo-300 text-sm">
                Details for {new Date(selectedDateDetails.date).toLocaleDateString(undefined, { dateStyle: "long" })}
              </h5>
              <button
                type="button"
                onClick={() => setSelectedDateDetails(null)}
                className="text-xs text-slate-400 hover:text-slate-200 font-bold"
              >
                × Close
              </button>
            </div>
            
            {selectedDateDetails.exams.length > 0 && (tabType === "exams" || tabType === "both") && (
              <div className="space-y-2">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Midterm & Endterm Exams:
                </div>
                {selectedDateDetails.exams.map((ex) => (
                  <div key={ex.id} className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
                    <div className="font-bold text-white text-sm">{ex.course_name}</div>
                    <div className="text-slate-350">{ex.exam_type}term Exam</div>
                    <div className="text-slate-400 flex justify-between">
                      <span>Room Hall: <strong className="text-indigo-300">{ex.room}</strong></span>
                      <span>Time: <strong className="text-slate-300">{ex.start_time} - {ex.end_time}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedDateDetails.events.length > 0 && (tabType === "calendar" || tabType === "both") && (
              <div className="space-y-2">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Academic Events & Holidays:
                </div>
                {selectedDateDetails.events.map((ev) => {
                  const isHoliday = ev.event_type === "Holiday";
                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isHoliday ? "bg-rose-500/10 border-rose-500/20 text-rose-350" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-350"
                      }`}
                    >
                      <div className="font-bold text-white text-sm">{ev.title}</div>
                      {ev.description && <div className="text-slate-300">{ev.description}</div>}
                      <div className="text-[10px] flex justify-between pt-1 border-t border-white/5">
                        <span className="uppercase tracking-wider font-bold">Type: {ev.event_type}</span>
                        <span>Ends: {new Date(ev.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {((tabType === "exams" && selectedDateDetails.exams.length === 0) ||
              (tabType === "calendar" && selectedDateDetails.events.length === 0) ||
              (selectedDateDetails.exams.length === 0 && selectedDateDetails.events.length === 0)) && (
              <p className="text-xs text-slate-500 italic">No schedules on this day.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Real QR Attendance claim camera scanner setup
  const startScanner = async () => {
    setScannerError("");
    setQrMsg("");
    setQrSuccess(false);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const minDim = Math.min(width, height);
            const size = Math.floor(minDim * 0.7);
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          setQrToken(decodedText);
          setQrSuccess(true);
          setQrMsg(lang === "en" 
            ? "🎉 QR Code detected successfully! Autoclaiming attendance..." 
            : "🎉 क्यूआर कोड पाया गया! ऑटो-क्लेम किया जा रहा है...");
          
          handleClaimQR(decodedText);
          stopScanner();
        },
        () => {
          // Silent noise handler
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setScannerError(lang === "en" 
        ? "Could not start camera feed. Please check browser camera permissions or upload an image instead." 
        : "कैमरा फीड शुरू नहीं की जा सकी। कृपया कैमरा अनुमति जांचें या छवि अपलोड करें।");
      setCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setCameraActive(false);
    scannerRef.current = null;
  };

  // Static QR Image Decryption
  const handleQrImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrMsg("");
    setQrSuccess(false);
    setScannerError("");

    await stopScanner();

    try {
      const html5QrCode = new Html5Qrcode("reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      setQrToken(decodedText);
      setQrSuccess(true);
      setQrMsg(lang === "en"
        ? "🎉 QR Code decoded successfully! Claiming attendance..."
        : "🎉 छवि से क्यूआर कोड डीकोड हो गया! क्लेम किया जा रहा है...");
      
      handleClaimQR(decodedText);
    } catch (err) {
      console.error("QR image upload scan error:", err);
      setQrSuccess(false);
      setQrMsg(lang === "en"
        ? "❌ Failed to detect a valid QR Code in the uploaded image file."
        : "❌ अपलोड की गई छवि में कोई वैध क्यूआर कोड नहीं मिला।");
    }
  };

  // Submit Claim QR Attendance Route
  const handleClaimQR = async (tokenValue) => {
    const rawValue = typeof tokenValue === "string" ? tokenValue : qrToken;
    if (!rawValue || !rawValue.trim()) return;
    setQrMsg("");
    setQrSuccess(false);
    
    // Parse rotating QR payload: {"token":"...","ts":...,"sig":"..."}
    let claimToken, claimTs, claimSig;
    try {
      const parsed = JSON.parse(rawValue.trim());
      claimToken = parsed.token;
      claimTs = parsed.ts;
      claimSig = parsed.sig;
      if (!claimToken || !claimTs || !claimSig) {
        throw new Error("Missing fields");
      }
    } catch {
      // Not a rotating QR payload — show error
      setQrSuccess(false);
      setQrMsg(lang === "en" 
        ? "❌ Invalid QR code format. Please scan the current QR code displayed by your teacher." 
        : "❌ अमान्य क्यूआर कोड प्रारूप। कृपया शिक्षक द्वारा प्रदर्शित वर्तमान क्यूआर कोड स्कैन करें।");
      return;
    }

    try {
      const res = await apiStudent.claimQRAttendance(user.id, claimToken, claimTs, claimSig);
      setQrSuccess(true);
      setQrMsg(res.message || (lang === "en" ? "Attendance marked successfully!" : "उपस्थिति सफलतापूर्वक दर्ज की गई!"));
      
      // Refresh summaries
      const attData = await apiStudent.getAttendanceSummary(user.id);
      setAttendanceSummary(attData || { overall: { present: 0, total: 0, percentage: 0 }, by_course: [] });
      
      const heatmap = await apiStudent.getAttendanceHeatmap(user.id);
      setHeatmapData(heatmap || []);
      
      setQrToken("");
    } catch (err) {
      setQrSuccess(false);
      setQrMsg(err.message || (lang === "en" ? "Failed to claim attendance." : "उपस्थिति दर्ज करने में विफल।"));
    }
  };

  // Scanner cleanup on tab switch
  useEffect(() => {
    if (activeTab !== "scan-qr") {
      stopScanner();
    } else {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [activeTab]);

  return (
    <DashboardLayout>
      {/* Onboarding Dialog */}
      {tourStep !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white">{tourSteps[tourStep].title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{tourSteps[tourStep].content}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={handleSkipTour}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold rounded-xl text-xs transition-all"
              >
                {lang === "en" ? "Skip Tour" : "टूर छोड़ें"}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30"
              >
                {tourStep === tourSteps.length - 1 ? (lang === "en" ? "Got It!" : "समझ गया!") : (lang === "en" ? "Next" : "आगे")}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6 animate-pulse">
          <div className="h-28 glass-panel rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 glass-panel rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[380px] glass-panel rounded-2xl" />
            <div className="h-[380px] glass-panel rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-transparent">
          {/* Student Profile Overview Panel */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 glass-panel p-6 rounded-2xl border border-white/5 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {user?.profile_pic ? (
                <img
                  src={`${BASE_URL}${user.profile_pic}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl font-black">
                  {(user?.name || user?.email || "S").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
                  {tt[lang].studentDashboard}
                </p>
                <h1 className="text-3xl font-black text-white">
                  {user?.name || user?.email?.split("@")[0]}
                </h1>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-xl font-bold border border-indigo-500/20">
              {tt[lang].semester} {user?.semester || "N/A"}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                <AssessmentIcon fontSize="large" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">{tt[lang].overallAttendance}</p>
                <h3 className="text-2xl font-black text-white">
                  {attendanceSummary?.overall?.percentage || 0}%
                </h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <BookIcon fontSize="large" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">{tt[lang].activeCourses}</p>
                <h3 className="text-2xl font-black text-white">{courses.length}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                <TrendingUpIcon fontSize="large" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">{tt[lang].averageScore}</p>
                <h3 className="text-2xl font-black text-white">{calculatedAverage}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                <WarningIcon fontSize="large" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">{tt[lang].issuesRaised}</p>
                <h3 className="text-2xl font-black text-white">{studentIssues.length}</h3>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/5 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
            {renderTabButton("dashboard", "activeTabDashboard")}
            {renderTabButton("timetable", "activeTabTimetable")}
            {renderTabButton("attendance", "activeTabAttendance")}
            {renderTabButton("grades", "activeTabGrades")}
            {renderTabButton("announcements", "activeTabAnnouncements")}
            {renderTabButton("assignments", "activeTabAssignments")}
            {renderTabButton("exams", "activeTabExams")}
            {renderTabButton("calendar", "activeTabCalendar")}
            {renderTabButton("issue", "activeTabIssue")}
            {renderTabButton("insights", "activeTabInsights")}
            {renderTabButton("scan-qr", "activeTabScanQR")}
          </div>

          {/* Dashboard Tab Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Customizable Widgets Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">🛠️ {tt[lang].customizeWidgets}:</span>
                  <span className="text-xs text-slate-400">{tt[lang].dragHeaders}</span>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  {widgets.map((widget) => (
                    <label key={widget.id} className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-slate-350 hover:text-white transition">
                      <input
                        type="checkbox"
                        checked={widget.visible}
                        onChange={() => {
                          setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, visible: !w.visible } : w));
                        }}
                        className="rounded border-slate-700 text-indigo-650 focus:ring-indigo-500"
                      />
                      {widget.title}
                    </label>
                  ))}
                  <button
                    onClick={() => {
                      setWidgets([
                        { id: "attendance_chart", title: "Attendance by Course", visible: true },
                        { id: "grades_chart", title: "Course Grades", visible: true },
                        { id: "recent_issues", title: "Recent Issues", visible: true },
                        { id: "attendance_heatmap", title: "Attendance Heatmap", visible: true }
                      ]);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
                  >
                    {tt[lang].resetLayout}
                  </button>
                </div>
              </div>

              {/* Grid of Drag and Drop Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {widgets.map((widget, idx) => {
                  if (!widget.visible) return null;
                  
                  const dndProps = {
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, idx),
                    onDragOver: (e) => handleDragOver(e, idx),
                    onDragEnd: handleDragEnd,
                    className: "transition-all duration-200"
                  };

                  if (widget.id === "attendance_chart") {
                    return (
                      <div key={widget.id} {...dndProps} className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing border-b border-white/5 pb-2">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-slate-500 font-bold">⋮⋮</span> {tt[lang].overallAttendance}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, visible: false } : w))}
                            className="text-xs text-rose-450 hover:text-rose-400"
                          >
                            {tt[lang].hide}
                          </button>
                        </div>
                        <div style={{ height: 300 }}>
                          {attendanceSummary?.by_course?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={attendanceSummary.by_course} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="course_name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <Tooltip
                                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                                />
                                <Bar dataKey="percentage" fill="url(#attendanceGrad)" radius={[6, 6, 0, 0]} barSize={26} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-slate-500 text-center mt-20">{tt[lang].noData}</p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === "grades_chart") {
                    return (
                      <div key={widget.id} {...dndProps} className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing border-b border-white/5 pb-2">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-slate-500 font-bold">⋮⋮</span> {tt[lang].gradesDetail}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, visible: false } : w))}
                            className="text-xs text-rose-455 hover:text-rose-400"
                          >
                            {tt[lang].hide}
                          </button>
                        </div>
                        <div style={{ height: 300 }}>
                          {grades.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={grades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="midGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.2} />
                                  </linearGradient>
                                  <linearGradient id="endGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="course_name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <Tooltip
                                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                                />
                                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                <Bar dataKey="mid" name="Mid Exam" fill="url(#midGrad)" radius={[4, 4, 0, 0]} barSize={16} />
                                <Bar dataKey="end" name="End Exam" fill="url(#endGrad)" radius={[4, 4, 0, 0]} barSize={16} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-slate-500 text-center mt-20">{tt[lang].noData}</p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (widget.id === "recent_issues") {
                    return (
                      <div key={widget.id} {...dndProps} className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing border-b border-white/5 pb-2">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-slate-500 font-bold">⋮⋮</span> {tt[lang].recentIssues}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, visible: false } : w))}
                            className="text-xs text-rose-455 hover:text-rose-400"
                          >
                            {tt[lang].hide}
                          </button>
                        </div>
                        {studentIssues.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="glass-table">
                              <thead>
                                <tr>
                                  <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">{tt[lang].course}</th>
                                  <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">{tt[lang].date}</th>
                                  <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">{tt[lang].status}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {studentIssues.slice(0, 5).map((issue) => (
                                  <tr key={issue.id} className="border-t border-white/5">
                                    <td className="font-semibold text-slate-200 p-3">{issue.course_name}</td>
                                    <td className="text-slate-400 p-3">{new Date(issue.date).toLocaleDateString()}</td>
                                    <td className="p-3">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        issue.status === "Approved"
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          : issue.status === "Rejected"
                                            ? "bg-rose-500/10 text-rose-455 border border-rose-500/20"
                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      }`}>
                                        {issue.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm mt-4">{tt[lang].noIssues}</p>
                        )}
                      </div>
                    );
                  }

                  if (widget.id === "attendance_heatmap") {
                    return (
                      <div key={widget.id} {...dndProps} className="lg:col-span-2 glass-panel p-0 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-6 pt-6 flex justify-between items-center cursor-grab active:cursor-grabbing">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-slate-500 font-bold">⋮⋮</span> {tt[lang].attendanceHeatmap}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, visible: false } : w))}
                            className="text-xs text-rose-455 hover:text-rose-400"
                          >
                            {tt[lang].hide}
                          </button>
                        </div>
                        <div className="px-6 pb-6">
                          <AttendanceHeatmap heatmapData={heatmapData} />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Timetable Tab Content */}
          {activeTab === "timetable" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-white mb-4">{tt[lang].timetable}</h3>
              {timetable.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                    const slots = timetable.filter((t) => t.day_of_week === day);
                    return (
                      <div key={day} className="p-4 rounded-2xl border border-white/5 bg-white/2 space-y-3">
                        <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">
                          {day}
                        </h4>
                        {slots.length > 0 ? (
                          <div className="space-y-3">
                            {slots.map((slot) => (
                              <div key={slot.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left">
                                <p className="font-bold text-white text-sm">{slot.course_name}</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                  {slot.start_time} - {slot.end_time}
                                </p>
                                <p className="text-xs text-indigo-300 font-bold mt-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg inline-block">
                                  Room: {slot.room}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-4 text-center">No classes</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No class schedule timetable recorded yet.</p>
              )}
            </div>
          )}

          {/* Attendance Detail Tab Content */}
          {activeTab === "attendance" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-8 animate-in fade-in duration-200">
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-6">{tt[lang].overallAttendanceSummary}</h3>
                {attendanceSummary?.by_course?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="glass-table">
                      <thead>
                        <tr>
                          <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Course</th>
                          <th className="text-center font-black text-xs uppercase tracking-wider text-slate-400 p-3">Present</th>
                          <th className="text-center font-black text-xs uppercase tracking-wider text-slate-400 p-3">Total Classes</th>
                          <th className="text-center font-black text-xs uppercase tracking-wider text-slate-400 p-3">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceSummary.by_course.map((att) => (
                          <tr key={att.course_id} className="border-t border-white/5">
                            <td className="font-semibold text-slate-200 p-3">{att.course_name}</td>
                            <td className="text-center text-slate-300 p-3">{att.present}</td>
                            <td className="text-center text-slate-300 p-3">{att.total}</td>
                            <td className="text-center p-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                att.percentage < 75
                                  ? "bg-rose-500/10 text-rose-455 border border-rose-500/25"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                              }`}>
                                {att.percentage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-white/5">
                          <td className="p-4 font-bold text-white rounded-l-xl text-left">Total (All Courses)</td>
                          <td className="p-4 text-center font-bold text-slate-200">{attendanceSummary.overall.present}</td>
                          <td className="p-4 text-center font-bold text-slate-200">{attendanceSummary.overall.total}</td>
                          <td className="p-4 text-center rounded-r-xl">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              attendanceSummary.overall.percentage < 75
                                ? "bg-rose-500/10 text-rose-455 border border-rose-500/25"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                            }`}>
                              {attendanceSummary.overall.percentage}%
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500">No attendance data available yet.</p>
                )}
              </div>

              {/* Monthly Checker */}
              <div className="pt-6 border-t border-white/5 text-left">
                <h3 className="text-xl font-bold text-white mb-4">{tt[lang].checkAttendanceMonth}</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <select
                    value={attendanceCheckCourseId}
                    onChange={(e) => setAttendanceCheckCourseId(e.target.value)}
                    className="glass-input min-w-[200px]"
                  >
                    <option value="" className="bg-slate-900">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={attendanceYear}
                    onChange={(e) => setAttendanceYear(e.target.value)}
                    placeholder="Year"
                    className="glass-input w-24"
                  />
                  <input
                    type="number"
                    value={attendanceMonth}
                    onChange={(e) => setAttendanceMonth(e.target.value)}
                    placeholder="Month"
                    min={1}
                    max={12}
                    className="glass-input w-24"
                  />
                  <button
                    onClick={handleCheckAttendanceByMonth}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                  >
                    Check
                  </button>
                </div>

                {/* Monthly result grid */}
                {attendanceByMonthResult.length > 0 && (
                  <div className="grid grid-cols-7 gap-2.5 max-w-md mt-6">
                    {attendanceByMonthResult.map((day) => (
                      <div
                        key={day.date}
                        className={`p-3 rounded-xl text-center font-bold shadow-md border ${
                          day.status?.toLowerCase() === "present"
                            ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                            : day.status?.toLowerCase() === "absent"
                              ? "bg-rose-500/10 text-rose-455 border-rose-500/20"
                              : "bg-white/5 text-slate-400 border-white/5"
                        }`}
                      >
                        {new Date(day.date).getDate()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grades Detail Tab Content */}
          {activeTab === "grades" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 animate-in fade-in duration-200 text-left">
              <h3 className="text-xl font-bold text-white mb-6">{tt[lang].gradesDetail}</h3>
              <div className="flex flex-wrap gap-6 items-center justify-between mb-6">
                <div className="flex flex-wrap gap-6 items-center">
                  <label className="flex items-center gap-2.5 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMid}
                      onChange={(e) => setShowMid(e.target.checked)}
                      className="w-4.5 h-4.5 rounded bg-slate-900 border-white/10 text-indigo-650 focus:ring-indigo-500"
                    />
                    Show Mid
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showEnd}
                      onChange={(e) => setShowEnd(e.target.checked)}
                      className="w-4.5 h-4.5 rounded bg-slate-900 border-white/10 text-indigo-650 focus:ring-indigo-500"
                    />
                    Show End
                  </label>
                  <input
                    type="number"
                    value={gradesSemester}
                    onChange={(e) => setGradesSemester(e.target.value)}
                    placeholder="Semester"
                    className="glass-input w-24"
                  />
                  <button
                    onClick={handleReloadGrades}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                  >
                    Reload Marks
                  </button>
                </div>
                <a
                  href={`${BASE_URL}/report/student/${user.id}/semester/${gradesSemester || user?.semester || 1}/download`}
                  download
                  className="px-6 py-2.5 bg-emerald-655 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer"
                >
                  Download PDF Report Card
                </a>
              </div>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Course</th>
                    {showMid && <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Mid Exam</th>}
                    {showEnd && <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">End Exam</th>}
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, idx) => (
                    <tr key={idx} className="border-t border-white/5">
                      <td className="font-semibold text-slate-200 p-3">{g.course_name ?? "-"}</td>
                      {showMid && <td className="text-slate-300 p-3">{g.mid ?? "-"}</td>}
                      {showEnd && <td className="text-slate-300 p-3">{g.end ?? "-"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Announcements Tab Content */}
          {activeTab === "announcements" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6 animate-in fade-in duration-200 text-left">
              <h3 className="text-xl font-bold text-white mb-4">{tt[lang].announcements}</h3>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-white">{ann.title}</h4>
                          <p className="text-xs text-indigo-400 font-semibold">{ann.course_name}</p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                      <div className="text-xs text-slate-500 pt-1">Posted by: {ann.teacher_name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No announcements posted yet.</p>
              )}
            </div>
          )}

          {/* Assignments Tab Content */}
          {activeTab === "assignments" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6 animate-in fade-in duration-200 text-left">
              <h3 className="text-xl font-bold text-white">{tt[lang].assignments}</h3>
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const sub = assignment.submission;
                    const isOverdue = new Date(assignment.due_date) < new Date() && !sub;
                    return (
                      <div key={assignment.id} className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h4 className="text-lg font-bold text-white">{assignment.title}</h4>
                            <p className="text-xs text-indigo-400 font-semibold">{assignment.course_name}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              sub?.status === "Graded"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                : sub?.status === "Submitted"
                                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25"
                                  : isOverdue
                                    ? "bg-rose-500/10 text-rose-455 border border-rose-500/25"
                                    : "bg-amber-500/10 text-amber-450 border border-amber-500/25"
                            }`}>
                              {sub ? sub.status : isOverdue ? "Overdue" : "Pending"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                              {getRemainingTime(assignment.due_date, !!sub)}
                            </span>
                          </div>
                        </div>
                        {assignment.description && <p className="text-sm text-slate-350">{assignment.description}</p>}
                        <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 border-t border-white/5 pt-3">
                          <div>Due: <span className="font-semibold text-slate-200">{new Date(assignment.due_date).toLocaleDateString()}</span></div>
                          <div>Max Marks: <span className="font-semibold text-slate-200">{assignment.max_marks}</span></div>
                        </div>

                        {sub && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 mt-2 text-sm">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Submission</div>
                            <p className="text-slate-300 whitespace-pre-wrap">{sub.submission_text}</p>
                            {sub.status === "Graded" && (
                              <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                                <div className="font-bold text-emerald-400">Score: {sub.marks_obtained} / {assignment.max_marks}</div>
                                {sub.feedback && <div className="text-slate-355 text-xs">Feedback: "{sub.feedback}"</div>}
                              </div>
                            )}
                          </div>
                        )}

                        {!sub && !isOverdue && (
                          <button
                            onClick={() => setActiveAssignmentId(assignment.id)}
                            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                          >
                            Submit Response
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No assignments set for your courses yet.</p>
              )}

              {activeAssignmentId && (
                <div className="p-6 border border-white/10 rounded-2xl bg-slate-900/90 space-y-4 animate-in fade-in duration-200">
                  <h4 className="font-bold text-white text-lg">Submit Assignment</h4>
                  <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Response / Answer Link:</label>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        required
                        className="glass-input w-full h-32 resize-none"
                        placeholder="Write your text or paste submission links here..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAssignmentId("");
                          setSubmissionText("");
                        }}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Exams Tab Content */}
          {activeTab === "exams" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6 animate-in fade-in duration-200 text-left">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Exam Scheduler</h3>
                  <p className="text-xs text-slate-400">View midterm and endterm exams on the visual calendar or list below.</p>
                </div>
              </div>
              {renderCalendarGrid("exams")}

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-md font-bold text-white">Upcoming Exams List</h4>
                {exams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam) => {
                      const examDate = new Date(exam.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const diffTime = examDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const remainingLabel = diffDays > 0
                        ? `⏳ ${diffDays} day(s) remaining`
                        : diffDays === 0
                          ? "🚨 Exam is TODAY!"
                          : "Completed";

                      return (
                        <div key={exam.id} className="p-5 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between gap-4 hover:bg-white/10 transition-all text-left">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-white">{exam.course_name}</h4>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                                  {exam.exam_type}term Exam
                                </p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                diffDays > 0
                                  ? "bg-amber-500/10 text-amber-450 border border-amber-500/25"
                                  : diffDays === 0
                                    ? "bg-rose-500/10 text-rose-455 border border-rose-500/25"
                                    : "bg-slate-500/10 text-slate-400 border border-slate-500/25"
                              }`}>
                                {remainingLabel}
                              </span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-350">
                              <div>📅 Date: <span className="text-white font-bold">{new Date(exam.date).toLocaleDateString()}</span></div>
                              <div>🕒 Time: <span className="text-white font-bold">{exam.start_time} - {exam.end_time}</span></div>
                              <div>🏫 Room Hall: <span className="text-indigo-300 font-bold">{exam.room}</span></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No upcoming exams scheduled.</p>
                )}
              </div>
            </div>
          )}

          {/* Calendar Tab Content */}
          {activeTab === "calendar" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6 animate-in fade-in duration-200 text-left">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Academic Calendar</h3>
                  <p className="text-xs text-slate-400">Holidays, events, and semester details visible in a monthly view.</p>
                </div>
              </div>
              {renderCalendarGrid("calendar")}

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-md font-bold text-white">Events & Holidays List</h4>
                {calendarEvents.length > 0 ? (
                  <div className="space-y-4">
                    {calendarEvents.map((evt) => {
                      const isHoliday = evt.event_type === "Holiday";
                      return (
                        <div key={evt.id} className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-start gap-4 animate-in fade-in duration-200">
                          <div className={`p-3 rounded-xl font-black text-center text-xs uppercase min-w-[65px] ${
                            isHoliday
                              ? "bg-rose-500/10 text-rose-455 border border-rose-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}>
                            <div>{new Date(evt.start_date).toLocaleDateString("en-US", { month: "short" })}</div>
                            <div className="text-lg">{new Date(evt.start_date).getDate()}</div>
                          </div>
                          <div className="space-y-1 text-left">
                            <h4 className="text-md font-bold text-white">{evt.title}</h4>
                            {evt.description && <p className="text-xs text-slate-355">{evt.description}</p>}
                            <div className="text-[10px] text-slate-500 pt-1 font-bold uppercase tracking-wider">
                              Type: {evt.event_type}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No calendar events available.</p>
                )}
              </div>
            </div>
          )}

          {/* Raise Issue Tab Content */}
          {activeTab === "issue" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left lg:col-span-1 h-fit">
                <h3 className="text-xl font-bold text-white mb-6">Raise an Issue</h3>
                <form onSubmit={handleRaiseIssueSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-355 mb-1.5">Course</label>
                    <select
                      value={issueCourseId}
                      onChange={(e) => setIssueCourseId(e.target.value)}
                      required
                      className="w-full glass-input"
                    >
                      <option value="" className="bg-slate-900">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-355 mb-1.5">Date of Issue</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      required
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-355 mb-1.5">Reason</label>
                    <textarea
                      placeholder="Describe your attendance dispute or issue..."
                      value={issueReason}
                      onChange={(e) => setIssueReason(e.target.value)}
                      required
                      className="w-full glass-input h-32 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-550 text-white font-bold rounded-xl w-full active:scale-98 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Submit Issue
                  </button>
                </form>
              </div>

              {/* Raised Issues List */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left lg:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">Raised Issues Status</h3>
                {studentIssues.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="glass-table">
                      <thead>
                        <tr>
                          <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Course</th>
                          <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Date</th>
                          <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Reason</th>
                          <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Status</th>
                          <th className="text-left font-black text-xs uppercase tracking-wider text-slate-400 p-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentIssues.map((issue) => (
                          <tr key={issue.id} className="border-t border-white/5">
                            <td className="font-semibold text-slate-200 p-3">{issue.course_name}</td>
                            <td className="text-slate-400 p-3">{new Date(issue.date).toLocaleDateString()}</td>
                            <td className="text-slate-300 p-3 truncate max-w-[150px]" title={issue.reason}>{issue.reason}</td>
                            <td className="p-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                issue.status === "Approved"
                                  ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                                  : issue.status === "Rejected"
                                    ? "bg-rose-500/10 text-rose-455 border border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {issue.status}
                              </span>
                            </td>
                            <td className="text-slate-355 p-3 italic">{issue.remark || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No issues raised yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Smart Insights Tab Content */}
          {activeTab === "insights" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              {insightsLoading ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">
                    {lang === "en" ? "Calculating predictive trajectory and recommendations..." : "पूर्वानुमानित गति और अनुशंसाओं की गणना की जा रही है..."}
                  </p>
                </div>
              ) : insightsMsg ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-2xl text-sm font-medium">
                  {insightsMsg}
                </div>
              ) : smartInsights ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* radial expected GPA */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4 lg:col-span-1">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-pulse-glow" />
                      <div className="absolute inset-2 rounded-full border-4 border-dashed border-indigo-500/30" />
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{smartInsights.predicted_gpa}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Predicted GPA</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-md">GPA Trajectory Forecast</h4>
                      <p className="text-xs text-slate-400 max-w-[200px]">Calculated based on current mid-term scores and attendance ratios.</p>
                    </div>
                  </div>

                  {/* expected trajectory details */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <AutoAwesomeIcon className="text-indigo-400" /> Expected End-Sem Performance Trajectories
                    </h3>
                    <div className="space-y-4">
                      {smartInsights.expected_performance?.map((item, index) => {
                        const isHighRisk = item.risk_level === "High";
                        const isMedRisk = item.risk_level === "Medium";
                        return (
                          <div key={index} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <span className="font-bold text-white text-sm">{item.course_name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Attendance: <strong>{item.attendance_rate}%</strong></span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                  isHighRisk
                                    ? "bg-rose-500/15 text-rose-455 border border-rose-500/30"
                                    : isMedRisk
                                      ? "bg-amber-500/15 text-amber-450 border border-amber-500/30"
                                      : "bg-emerald-500/15 text-emerald-455 border border-emerald-500/30"
                                }`}>
                                  {item.risk_level} Risk
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-slate-355">
                                <span>Expected Marks (End-Sem forecast)</span>
                                <span className="font-bold text-white">{item.expected_score.toFixed(1)} / 100</span>
                              </div>
                              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isHighRisk ? "bg-rose-500" : isMedRisk ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${item.expected_score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* recommendations list */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-3 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <PsychologyIcon className="text-indigo-400" /> AI-Driven Study Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {smartInsights.study_recommendations?.map((rec, index) => {
                        const isHigh = rec.risk_level === "High";
                        const isMed = rec.risk_level === "Medium";
                        return (
                          <div key={index} className={`p-5 rounded-2xl border flex flex-col justify-between ${
                            isHigh
                              ? "bg-rose-500/5 border-rose-500/20"
                              : isMed
                                ? "bg-amber-500/5 border-amber-500/20"
                                : "bg-emerald-500/5 border-emerald-500/20"
                          }`}>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-black text-white text-md">{rec.course_name}</h4>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isHigh
                                    ? "bg-rose-500/15 text-rose-455"
                                    : isMed
                                      ? "bg-amber-500/15 text-amber-450"
                                      : "bg-emerald-500/15 text-emerald-455"
                                }`}>
                                  {rec.risk_level}
                                </span>
                              </div>
                              <p className="text-sm text-slate-305 leading-relaxed">{rec.recommendation}</p>
                            </div>
                            {rec.focus_areas && rec.focus_areas.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-white/5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Key Areas:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {rec.focus_areas.map((area, aIdx) => (
                                    <span key={aIdx} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[11px] rounded-lg text-slate-355">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No smart insights loaded.</p>
              )}
            </div>
          )}

          {/* Smart Attendance Tab Content */}
          {activeTab === "scan-qr" && (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200 text-center">
              <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <QrCodeScannerIcon className="text-indigo-400" /> Smart Scanner Attendance
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Scan the classroom attendance session QR code directly via your device camera, or upload a captured QR image file to claim present status.
              </p>

              {/* Viewfinder container */}
              <div
                id="reader"
                className="w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl relative flex flex-col items-center justify-center"
                style={{ minHeight: "280px" }}
              >
                {!cameraActive && (
                  <div className="p-8 text-center space-y-4">
                    <QrCodeScannerIcon style={{ fontSize: "64px", opacity: 0.15 }} className="text-indigo-400 animate-pulse" />
                    <p className="text-xs text-slate-500">Camera stream is offline</p>
                  </div>
                )}
              </div>

              {/* Feedback messages */}
              {scannerError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold text-left max-w-md mx-auto">
                  ⚠️ {scannerError}
                </div>
              )}

              {qrMsg && (
                <div className={`p-4 rounded-xl text-xs font-bold text-left max-w-md mx-auto border ${
                  qrSuccess
                    ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-455 border-rose-500/20"
                }`}>
                  {qrMsg}
                </div>
              )}

              {/* Interactive buttons */}
              <div className="flex flex-wrap gap-4 justify-center items-center max-w-md mx-auto">
                {cameraActive ? (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="px-6 py-2.5 bg-rose-650 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Turn Camera Off
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startScanner}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/35 active:scale-95 cursor-pointer"
                  >
                    Start Live Scanner
                  </button>
                )}

                {/* Upload QR screenshot */}
                <label className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95">
                  📁 {lang === "en" ? "Upload QR Image" : "क्यूआर छवि अपलोड करें"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Manual code input fallback */}
              <div className="pt-6 border-t border-white/5 max-w-md mx-auto text-left space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Manual Session Token Input
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleClaimQR();
                  }}
                  className="flex gap-2.5"
                >
                  <input
                    type="text"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="Paste attendance token hex here..."
                    className="glass-input flex-1"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-655 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Claim
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* General Message banner */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-semibold max-w-md mx-auto border text-left animate-in fade-in duration-200 ${
              message.toLowerCase().includes("success") || message.includes("✅")
                ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-455 border-rose-500/20"
            }`}>
              {message}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;