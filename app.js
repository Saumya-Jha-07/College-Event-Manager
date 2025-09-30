function app() {
  // Local date helpers to avoid UTC shifts
  const dateToLocalYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const addDaysLocal = (date, days) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + days);
    return d;
  };

  const ymdToDateLocal = (ymd) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  return {
    // State
    isLoading: true,
    sidebarOpen: false,
    fabOpen: false,
    currentPage: "dashboard",
    selectedClub: "all",
    searchQuery: "",
    showNotifications: false,
    showEventModal: false,
    showDayEventsModal: false,
    showStudentClubModal: false,
    selectedEvent: null,
    selectedDayEvents: [],
    studentClubSelection: "",
    calendarView: "month",
    // Authentication & Membership
    currentUser: null,
    loginForm: { username: "", password: "" },
    loginError: "",
    users: [
      { username: "admin", password: "admin123", role: "admin" },
      { username: "head_astronomy", password: "head123", role: "clubHead", club: "astronomy" },
      { username: "head_sports", password: "head123", role: "clubHead", club: "sports" },
      { username: "head_gdg", password: "head123", role: "clubHead", club: "gdg" },
      { username: "head_music", password: "head123", role: "clubHead", club: "music" },
      { username: "head_drama", password: "head123", role: "clubHead", club: "drama" },
      { username: "student", password: "student123", role: "student" }
    ],
    memberships: {}, // username -> club
    joinRequests: [], // {id, username, name, email, club, status}
    joinRequestForm: { name: "", email: "", club: "" },
    events: [
      // Astronomy Club Events
      {
        id: 1,
        name: "Stargazing Night",
        date: dateToLocalYMD(new Date()),
        time: "20:00",
        description: "Join us for an evening of stargazing and astronomy discussions.",
        club: "astronomy",
        location: "College Observatory",
      },
      {
        id: 2,
        name: "Telescope Workshop",
        date: dateToLocalYMD(addDaysLocal(new Date(), 7)),
        time: "15:00",
        description: "Learn how to use and maintain telescopes.",
        club: "astronomy",
        location: "Physics Lab",
      },
      // Sports Club Events
      {
        id: 3,
        name: "Football Tournament",
        date: dateToLocalYMD(addDaysLocal(new Date(), 3)),
        time: "14:00",
        description: "Annual inter-college football tournament.",
        club: "sports",
        location: "College Ground",
      },
      {
        id: 4,
        name: "Basketball Practice",
        date: dateToLocalYMD(addDaysLocal(new Date(), 5)),
        time: "16:00",
        description: "Regular basketball practice session.",
        club: "sports",
        location: "Basketball Court",
      },
      // GDG Club Events
      {
        id: 5,
        name: "Web Development Workshop",
        date: dateToLocalYMD(addDaysLocal(new Date(), 2)),
        time: "10:00",
        description: "Learn modern web development techniques.",
        club: "gdg",
        location: "Computer Lab 1",
      },
      {
        id: 6,
        name: "AI & ML Meetup",
        date: dateToLocalYMD(addDaysLocal(new Date(), 9)),
        time: "11:00",
        description: "Discussion on latest AI and ML trends.",
        club: "gdg",
        location: "Conference Room",
      },
      // Music Club Events
      {
        id: 7,
        name: "Jazz Night",
        date: dateToLocalYMD(addDaysLocal(new Date(), 4)),
        time: "19:00",
        description: "Live jazz performance by club members.",
        club: "music",
        location: "Auditorium",
      },
      {
        id: 8,
        name: "Music Theory Class",
        date: dateToLocalYMD(addDaysLocal(new Date(), 6)),
        time: "17:00",
        description: "Basic music theory for beginners.",
        club: "music",
        location: "Music Room",
      },
      // Drama Club Events
      {
        id: 9,
        name: "Play Rehearsal",
        date: dateToLocalYMD(addDaysLocal(new Date(), 8)),
        time: "18:00",
        description: "Rehearsal for upcoming play.",
        club: "drama",
        location: "Drama Studio",
      },
      {
        id: 10,
        name: "Acting Workshop",
        date: dateToLocalYMD(addDaysLocal(new Date(), 10)),
        time: "15:00",
        description: "Improve your acting skills with professional guidance.",
        club: "drama",
        location: "Drama Studio",
      },
    ],
    showAlert: false,
    alertMessage: "",
    selectedDate: "",
    currentDate: new Date(),
    newEvent: {
      name: "",
      date: "",
      time: "",
      description: "",
      club: "",
      location: "",
    },
    contactForm: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },

    // Computed properties
    get currentMonth() {
      return this.currentDate.toLocaleString("default", { month: "long" });
    },

    get currentYear() {
      return this.currentDate.getFullYear();
    },

    get weekdays() {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    },

    // Role-aware selected club for visibility
    get effectiveSelectedClub() {
      if (this.isAdmin()) return "all";
      if (this.isClubHead()) return this.currentUser?.club || null;
      if (this.isStudent()) return this.memberships[this.currentUser?.username] || null;
      return this.selectedClub;
    },

    get calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const days = [];
      const startingDay = firstDay.getDay();

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDay; i++) {
        days.push("");
      }

      // Add days of the month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(i);
      }

      return days;
    },

    // Methods
    // Role helpers
    isAdmin() {
      return this.currentUser?.role === "admin";
    },
    isClubHead() {
      return this.currentUser?.role === "clubHead";
    },
    isStudent() {
      return this.currentUser?.role === "student";
    },
    canCreateEvent() {
      return this.isAdmin() || this.isClubHead();
    },
    canManageRequests() {
      return this.isAdmin() || this.isClubHead();
    },
    getUserClub() {
      if (this.isAdmin()) return "all";
      if (this.isClubHead()) return this.currentUser?.club || null;
      if (this.isStudent()) return this.memberships[this.currentUser?.username] || null;
      return null;
    },
    // Auth
    login() {
      this.loginError = "";
      const user = this.users.find(
        (u) => u.username === this.loginForm.username && u.password === this.loginForm.password
      );
      if (!user) {
        this.loginError = "Invalid credentials";
        return;
      }
      this.currentUser = { ...user };
      localStorage.setItem("i2it-current-user", JSON.stringify(this.currentUser));
      const userClub = this.getUserClub();
      this.selectedClub = this.isAdmin() ? "all" : (userClub || null);
      this.currentPage = "dashboard";
      this.showAlert = true;
      this.alertMessage = `Welcome, ${this.currentUser.username}!`;
      setTimeout(() => { this.showAlert = false; }, 2000);
      // Prompt first-time students to choose a club
      if (this.isStudent() && !this.memberships[this.currentUser.username]) {
        this.showStudentClubModal = true;
      }
    },
    logout() {
      this.currentUser = null;
      localStorage.removeItem("i2it-current-user");
      this.currentPage = "login";
      this.selectedClub = "all";
    },
    // Join requests (students request to join; admin/heads approve/deny)
    submitJoinRequest() {
      if (!this.isStudent()) return;
      if (!this.joinRequestForm.name || !this.joinRequestForm.email || !this.joinRequestForm.club) return;
      const existingPending = this.joinRequests.find(
        (r) => r.username === this.currentUser.username && r.status === "pending"
      );
      if (existingPending) {
        this.showAlert = true;
        this.alertMessage = "You already have a pending request.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }
      const req = {
        id: Date.now(),
        username: this.currentUser.username,
        name: this.joinRequestForm.name,
        email: this.joinRequestForm.email,
        club: this.joinRequestForm.club,
        status: "pending",
      };
      this.joinRequests.push(req);
      this.saveJoinData();
      this.joinRequestForm = { name: "", email: "", club: "" };
      this.showAlert = true;
      this.alertMessage = "Join request submitted.";
      setTimeout(() => { this.showAlert = false; }, 2500);
    },
    approveRequest(request) {
      if (!this.canManageRequests()) return;
      if (this.isClubHead() && request.club !== this.currentUser.club) return;
      request.status = "approved";
      this.memberships[request.username] = request.club;
      this.saveJoinData();
      this.showAlert = true;
      this.alertMessage = `Approved ${request.name} for ${request.club}`;
      setTimeout(() => { this.showAlert = false; }, 2000);
    },
    denyRequest(request) {
      if (!this.canManageRequests()) return;
      if (this.isClubHead() && request.club !== this.currentUser.club) return;
      request.status = "denied";
      this.saveJoinData();
      this.showAlert = true;
      this.alertMessage = `Denied ${request.name}`;
      setTimeout(() => { this.showAlert = false; }, 2000);
    },
    getPendingRequests() {
      if (this.isAdmin()) return this.joinRequests.filter(r => r.status === "pending");
      if (this.isClubHead()) return this.joinRequests.filter(r => r.status === "pending" && r.club === this.currentUser.club);
      return [];
    },
    getAllRequests() {
      if (this.isAdmin()) return this.joinRequests;
      if (this.isClubHead()) return this.joinRequests.filter(r => r.club === this.currentUser.club);
      return [];
    },
    saveJoinData() {
      localStorage.setItem("i2it-join-requests", JSON.stringify(this.joinRequests));
      localStorage.setItem("i2it-memberships", JSON.stringify(this.memberships));
    },
    getPageTitle() {
      const titles = {
        dashboard: "Dashboard",
        calendar: "Calendar",
        events: "Add Event",
        analytics: "Analytics",
        about: "About",
        contact: "Contact",
        requests: "Join Requests",
        login: "Login",
      };
      return titles[this.currentPage] || "Dashboard";
    },

    getClubName(club) {
      const names = {
        astronomy: "Astronomy Club",
        sports: "Sports Club",
        gdg: "GDG Club",
        music: "Music Club",
        drama: "Drama Club"
      };
      return names[club] || club;
    },

    getTodayEvents() {
      const today = this.dateToLocalYMD(new Date());
      const club = this.effectiveSelectedClub;
      return this.events.filter(event => 
        event.date === today && 
        (club === "all" || event.club === club)
      );
    },

    getUpcomingEvents() {
      const today = this.dateToLocalYMD(new Date());
      const club = this.effectiveSelectedClub;
      return this.events
        .filter(event => 
          event.date >= today && 
          (club === "all" || event.club === club)
        )
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    getCompletedEvents() {
      const today = this.dateToLocalYMD(new Date());
      const club = this.effectiveSelectedClub;
      return this.events.filter(event => 
        event.date < today && 
        (club === "all" || event.club === club)
      );
    },

    getThisMonthEvents() {
      const currentMonth = this.currentDate.getMonth() + 1;
      const currentYear = this.currentDate.getFullYear();
      return this.events.filter(event => {
        const [y, m] = event.date.split("-").map(Number);
        return y === currentYear && m === currentMonth;
      });
    },

    getNextMonthEvents() {
      const currentYear = this.currentDate.getFullYear();
      let nextMonth = this.currentDate.getMonth() + 2; // human 1-12
      let yearForNext = currentYear;
      if (nextMonth === 13) { nextMonth = 1; yearForNext += 1; }
      return this.events.filter(event => {
        const [y, m] = event.date.split("-").map(Number);
        return y === yearForNext && m === nextMonth;
      });
    },

    filterEvents() {
      // This method is called when club selector changes
      // The filtering is handled by the computed properties above
    },

    addEvent() {
      if (!this.canCreateEvent()) {
        this.showAlert = true;
        this.alertMessage = "Not authorized to create events.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }
      const event = {
        id: Date.now(),
        ...this.newEvent,
      };
      if (this.isClubHead()) {
        event.club = this.currentUser.club;
      }

      // Basic validations
      if (!event.date || !event.time || !event.name) {
        this.showAlert = true;
        this.alertMessage = "Please fill in name, date and time.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Conflict detection: same date & time within same club (or globally if admin wants)
      const conflict = this.events.find(e => e.date === event.date && e.time === event.time && (this.isAdmin() || e.club === event.club));
      if (conflict) {
        this.showAlert = true;
        this.alertMessage = `Time clash: Another event ("${conflict.name}") exists at ${event.time}.`;
        setTimeout(() => { this.showAlert = false; }, 3500);
        return;
      }

      this.events.push(event);
      this.saveEvents();
      this.showAlert = true;
      this.alertMessage = "Event created successfully!";
      this.resetEventForm();
      this.currentPage = "dashboard";

      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    },

    deleteEvent(event) {
      // Authorization: admin or club head for own club
      if (!(this.isAdmin() || (this.isClubHead() && event.club === this.currentUser?.club))) {
        this.showAlert = true;
        this.alertMessage = "Not authorized to delete this event.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }
      this.events = this.events.filter((e) => e.id !== event.id);
      this.saveEvents();
      this.showAlert = true;
      this.alertMessage = "Event deleted successfully!";
      this.showEventModal = false;

      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    },

    editEvent(event) {
      // Authorization: admin or club head for own club
      if (!(this.isAdmin() || (this.isClubHead() && event.club === this.currentUser?.club))) {
        this.showAlert = true;
        this.alertMessage = "Not authorized to edit this event.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }
      this.selectedEvent = event;
      this.newEvent = { ...event };
      this.currentPage = "events";
      this.showEventModal = false;
    },

    showEventDetails(event) {
      this.selectedEvent = event;
      this.showEventModal = true;
    },

    hasEvent(day) {
      if (!day) return false;
      const ymd = this.dateToLocalYMD(new Date(this.currentYear, this.currentDate.getMonth(), day));
      const club = this.effectiveSelectedClub;
      return this.events.some(
        (event) =>
          event.date === ymd &&
          (club === "all" || event.club === club)
      );
    },

    getEventsForDate(dateYMD) {
      const club = this.effectiveSelectedClub;
      return this.events.filter(
        (event) =>
          event.date === dateYMD &&
          (club === "all" || event.club === club)
      );
    },

    showDayEvents(day) {
      if (!day) return;
      const date = new Date(this.currentYear, this.currentDate.getMonth(), day);
      this.selectedDate = this.dateToLocalYMD(date);
      const events = this.getEventsForDate(this.selectedDate)
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time));
      if (events.length === 1) {
        this.selectedEvent = events[0];
        this.showEventModal = true;
      } else if (events.length > 1) {
        this.selectedDayEvents = events;
        this.showDayEventsModal = true;
      }
    },

    isToday(day) {
      if (!day) return false;
      const today = new Date();
      return day === today.getDate() && 
             this.currentDate.getMonth() === today.getMonth() && 
             this.currentYear === today.getFullYear();
    },

    previousMonth() {
      this.currentDate = new Date(
        this.currentYear,
        this.currentDate.getMonth() - 1,
        1
      );
    },

    nextMonth() {
      this.currentDate = new Date(
        this.currentYear,
        this.currentDate.getMonth() + 1,
        1
      );
    },

    resetEventForm() {
      this.newEvent = {
        name: "",
        date: "",
        time: "",
        description: "",
        club: "",
        location: "",
      };
    },

    submitContact() {
      this.showAlert = true;
      this.alertMessage = "Thank you for your message! We will get back to you soon.";
      this.contactForm = {
        name: "",
        email: "",
        subject: "",
        message: "",
      };

      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    },

    markAllAsRead() {
      this.showNotifications = false;
    },

    exportEvents() {
      const dataStr = JSON.stringify(this.events, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'i2it-events.json';
      link.click();
      URL.revokeObjectURL(url);
      
      this.showAlert = true;
      this.alertMessage = "Events exported successfully!";
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    },

    saveEvents() {
      localStorage.setItem("i2it-events", JSON.stringify(this.events));
    },

    isSameDay(date1, date2) {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const [y, m, d] = dateString.split("-").map(Number);
      const date = new Date(y, (m || 1) - 1, d || 1);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },

    formatEventTime(dateString, timeString) {
      if (!dateString || !timeString) return "";
      const date = new Date(dateString + "T" + timeString);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    // Initialize
    init() {
      // Simulate loading
      setTimeout(() => {
        this.isLoading = false;
      }, 1500);

      // Load saved events from localStorage
      const savedEvents = JSON.parse(localStorage.getItem("i2it-events"));
      if (savedEvents && savedEvents.length > 0) {
        this.events = savedEvents;
      }

      // Load auth/session & join data
      const savedUser = JSON.parse(localStorage.getItem("i2it-current-user"));
      const savedRequests = JSON.parse(localStorage.getItem("i2it-join-requests"));
      const savedMemberships = JSON.parse(localStorage.getItem("i2it-memberships"));
      if (Array.isArray(savedRequests)) this.joinRequests = savedRequests;
      if (savedMemberships && typeof savedMemberships === "object") this.memberships = savedMemberships;
      if (savedUser) {
        this.currentUser = savedUser;
        const club = this.getUserClub();
        this.selectedClub = this.isAdmin() ? "all" : (club || null);
        if (this.isStudent() && !this.memberships[this.currentUser.username]) {
          this.showStudentClubModal = true;
        }
      } else {
        this.currentPage = "login";
      }

      // Check for upcoming events every minute
      setInterval(() => {
        const now = new Date();
        const upcomingEvents = this.events.filter((event) => {
          const eventDate = new Date(event.date + "T" + event.time);
          const timeDiff = eventDate - now;
          return timeDiff > 0 && timeDiff < 30 * 60 * 1000; // 30 minutes
        });

        if (upcomingEvents.length > 0 && !this.showAlert) {
          this.showAlert = true;
          this.alertMessage = `Upcoming event: ${upcomingEvents[0].name} at ${upcomingEvents[0].time}`;

          setTimeout(() => {
            this.showAlert = false;
          }, 5000);
        }
      }, 60000); // Check every minute
    },

    // expose helpers to templates/methods
    dateToLocalYMD: (date) => dateToLocalYMD(date),
    ymdToDateLocal: (ymd) => ymdToDateLocal(ymd),
    addDaysLocal: (date, days) => addDaysLocal(date, days),

    // Student first-time registration club selection
    confirmStudentClub() {
      if (!this.isStudent()) { this.showStudentClubModal = false; return; }
      if (!this.studentClubSelection) return;
      this.memberships[this.currentUser.username] = this.studentClubSelection;
      this.saveJoinData();
      this.selectedClub = this.studentClubSelection;
      this.showStudentClubModal = false;
      this.showAlert = true;
      this.alertMessage = `Club set to ${this.getClubName(this.studentClubSelection)}.`;
      setTimeout(() => { this.showAlert = false; }, 2000);
    },
  };
}