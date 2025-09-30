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
    showAllEvents: false,
    // User Management
    userManagementTab: "users",
    userSearchQuery: "",
    userRoleFilter: "",
    userBranchFilter: "",
    selectedUsers: [],
    showEditUserModal: false,
    editingUser: {
      username: "",
      password: "",
      role: "",
      club: "",
      branch: "",
      email: ""
    },
    newUser: {
      username: "",
      password: "",
      role: "",
      club: "",
      branch: "",
      email: ""
    },
    newBranch: {
      name: "",
      code: "",
      description: ""
    },
    branches: [
      { id: 1, name: "Information Technology", code: "IT", description: "Computer Science and Information Technology" },
      { id: 2, name: "Computer Science Engineering", code: "CSE", description: "Computer Science and Engineering" },
      { id: 3, name: "Electronics and Telecommunication", code: "E&TC", description: "Electronics and Telecommunication Engineering" }
    ],
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

    // Daily view helpers
    get selectedDayEvents() {
      if (!this.selectedDate) return [];
      return this.getEventsForDate(this.selectedDate)
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    get selectedDayCount() {
      return this.selectedDayEvents.length;
    },

    get allVisibleEvents() {
      const club = this.effectiveSelectedClub;
      return this.events
        .filter(e => (club === "all" || e.club === club))
        .slice()
        .sort((a, b) => (a.date + "T" + a.time).localeCompare(b.date + "T" + b.time));
    },

    get filteredUsers() {
      let filtered = this.users;
      
      // Search filter
      if (this.userSearchQuery) {
        const query = this.userSearchQuery.toLowerCase();
        filtered = filtered.filter(user => 
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.branch.toLowerCase().includes(query)
        );
      }
      
      // Role filter
      if (this.userRoleFilter) {
        filtered = filtered.filter(user => user.role === this.userRoleFilter);
      }
      
      // Branch filter
      if (this.userBranchFilter) {
        filtered = filtered.filter(user => user.branch === this.userBranchFilter);
      }
      
      return filtered;
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
        about: "About",
        contact: "Contact",
        requests: "Join Requests",
        userManagement: "User Management",
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
      this.alertMessage = "I²IT Events exported successfully!";
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
      const savedUsers = JSON.parse(localStorage.getItem("i2it-users"));
      const savedBranches = JSON.parse(localStorage.getItem("i2it-branches"));
      
      if (Array.isArray(savedRequests)) this.joinRequests = savedRequests;
      if (savedMemberships && typeof savedMemberships === "object") this.memberships = savedMemberships;
      if (Array.isArray(savedUsers)) this.users = savedUsers;
      if (Array.isArray(savedBranches)) this.branches = savedBranches;
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

      // Default daily view to today
      if (!this.selectedDate) {
        this.selectedDate = this.dateToLocalYMD(new Date());
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

    // User Management Functions
    createUser() {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can create users.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Check if username already exists
      const existingUser = this.users.find(u => u.username === this.newUser.username);
      if (existingUser) {
        this.showAlert = true;
        this.alertMessage = "Username already exists.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Validate required fields
      if (!this.newUser.username || !this.newUser.password || !this.newUser.role || !this.newUser.branch) {
        this.showAlert = true;
        this.alertMessage = "Please fill in all required fields.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Create new user
      const user = {
        username: this.newUser.username,
        password: this.newUser.password,
        role: this.newUser.role,
        branch: this.newUser.branch,
        email: this.newUser.email || ""
      };

      // Add club if role is clubHead
      if (this.newUser.role === 'clubHead' && this.newUser.club) {
        user.club = this.newUser.club;
      }

      this.users.push(user);
      this.saveUsers();
      this.resetUserForm();
      
      this.showAlert = true;
      this.alertMessage = `User "${user.username}" created successfully!`;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },

    deleteUser(user) {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can delete users.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      if (user.username === 'admin') {
        this.showAlert = true;
        this.alertMessage = "Cannot delete the main administrator.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      this.users = this.users.filter(u => u.username !== user.username);
      this.saveUsers();
      
      this.showAlert = true;
      this.alertMessage = `User "${user.username}" deleted successfully!`;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },

    resetUserForm() {
      this.newUser = {
        username: "",
        password: "",
        role: "",
        club: "",
        branch: "",
        email: ""
      };
    },

    updateRoleOptions() {
      // Reset club selection when role changes
      if (this.newUser.role !== 'clubHead') {
        this.newUser.club = "";
      }
    },

    addBranch() {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can add branches.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      if (!this.newBranch.name || !this.newBranch.code) {
        this.showAlert = true;
        this.alertMessage = "Please fill in branch name and code.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Check if branch code already exists
      const existingBranch = this.branches.find(b => b.code === this.newBranch.code);
      if (existingBranch) {
        this.showAlert = true;
        this.alertMessage = "Branch code already exists.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      const branch = {
        id: Date.now(),
        name: this.newBranch.name,
        code: this.newBranch.code,
        description: this.newBranch.description || ""
      };

      this.branches.push(branch);
      this.saveBranches();
      
      this.newBranch = { name: "", code: "", description: "" };
      
      this.showAlert = true;
      this.alertMessage = `Branch "${branch.name}" added successfully!`;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },

    editBranch(branch) {
      // For now, just show an alert. In a real app, you'd open an edit modal
      this.showAlert = true;
      this.alertMessage = "Branch editing functionality coming soon!";
      setTimeout(() => { this.showAlert = false; }, 2500);
    },

    deleteBranch(branch) {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can delete branches.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      this.branches = this.branches.filter(b => b.id !== branch.id);
      this.saveBranches();
      
      this.showAlert = true;
      this.alertMessage = `Branch "${branch.name}" deleted successfully!`;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },

    saveUsers() {
      localStorage.setItem("i2it-users", JSON.stringify(this.users));
    },

    saveBranches() {
      localStorage.setItem("i2it-branches", JSON.stringify(this.branches));
    },

    // Enhanced User Management Methods
    getUsersByRole(role) {
      return this.users.filter(user => user.role === role);
    },

    editUser(user) {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can edit users.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      this.editingUser = { ...user };
      this.showEditUserModal = true;
    },

    updateUser() {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can update users.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      const userIndex = this.users.findIndex(u => u.username === this.editingUser.username);
      if (userIndex === -1) {
        this.showAlert = true;
        this.alertMessage = "User not found.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Update user data
      this.users[userIndex] = { ...this.editingUser };
      
      // Only update password if provided
      if (!this.editingUser.password) {
        // Keep existing password
        delete this.users[userIndex].password;
      }

      this.saveUsers();
      this.showEditUserModal = false;
      
      this.showAlert = true;
      this.alertMessage = `User "${this.editingUser.username}" updated successfully!`;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },

    resetUserPassword(user) {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can reset passwords.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Generate a random password
      const newPassword = Math.random().toString(36).slice(-8);
      
      const userIndex = this.users.findIndex(u => u.username === user.username);
      if (userIndex !== -1) {
        this.users[userIndex].password = newPassword;
        this.saveUsers();
        
        this.showAlert = true;
        this.alertMessage = `Password reset for "${user.username}". New password: ${newPassword}`;
        setTimeout(() => { this.showAlert = false; }, 5000);
      }
    },

    bulkDeleteUsers() {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can delete users.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      if (this.selectedUsers.length === 0) {
        this.showAlert = true;
        this.alertMessage = "No users selected.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      // Remove admin from selection
      const usersToDelete = this.selectedUsers.filter(username => username !== 'admin');
      
      this.users = this.users.filter(user => !usersToDelete.includes(user.username));
      this.saveUsers();
      this.clearSelection();
      
      this.showAlert = true;
      this.alertMessage = `${usersToDelete.length} users deleted successfully!`;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },

    bulkResetPasswords() {
      if (!this.isAdmin()) {
        this.showAlert = true;
        this.alertMessage = "Only administrators can reset passwords.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      if (this.selectedUsers.length === 0) {
        this.showAlert = true;
        this.alertMessage = "No users selected.";
        setTimeout(() => { this.showAlert = false; }, 2500);
        return;
      }

      const resetPasswords = [];
      this.selectedUsers.forEach(username => {
        const userIndex = this.users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
          const newPassword = Math.random().toString(36).slice(-8);
          this.users[userIndex].password = newPassword;
          resetPasswords.push(`${username}: ${newPassword}`);
        }
      });

      this.saveUsers();
      this.clearSelection();
      
      this.showAlert = true;
      this.alertMessage = `Passwords reset for ${resetPasswords.length} users. Check console for details.`;
      console.log('Reset passwords:', resetPasswords);
      setTimeout(() => { this.showAlert = false; }, 5000);
    },

    clearSelection() {
      this.selectedUsers = [];
    },
  };
}