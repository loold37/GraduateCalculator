/* =====================================================
   졸업요건 계산기 — app.js
   2-Column Drag & Drop / 이수학기 매핑 / 계산 엔진
   ===================================================== */

(function () {
  'use strict';

  // ───────── Course Data ─────────

  const MAJOR_COURSES = [
    // 1학년 1학기
    { id: 'COED0201', name: '컴퓨터 프로그래밍 1', credits: 3, practice: true, year: 1, semester: 1, field: '필수' },
    // 1학년 2학기
    { id: 'COED0202', name: '컴퓨터 프로그래밍 2', credits: 3, practice: true, year: 1, semester: 2, field: null },
    { id: 'COED0204', name: '컴퓨터수학', credits: 3, practice: false, year: 1, semester: 2, field: '2' },
    { id: 'COED0205', name: '정보윤리교육론', credits: 3, practice: false, year: 1, semester: 2, field: '6' },
    // 2학년 1학기
    { id: 'COED0203', name: '컴퓨터 프로그래밍 3', credits: 3, practice: true, year: 2, semester: 1, field: null },
    { id: 'COME0331', name: '자료구조', credits: 3, practice: false, year: 2, semester: 1, field: '3' },
    { id: 'COME0427', name: '데이터베이스', credits: 3, practice: false, year: 2, semester: 1, field: '3' },
    { id: 'ELEC0247', name: '논리회로', credits: 3, practice: false, year: 2, semester: 1, field: '5' },
    // 2학년 2학기
    { id: 'COED0206', name: '피지컬 컴퓨팅', credits: 3, practice: true, year: 2, semester: 2, field: null },
    { id: 'COED0207', name: '정보보안 기초', credits: 3, practice: false, year: 2, semester: 2, field: null },
    { id: 'COMP0325', name: '알고리즘', credits: 3, practice: false, year: 2, semester: 2, field: '2' },
    { id: 'COMP0411', name: '컴퓨터구조', credits: 3, practice: false, year: 2, semester: 2, field: '5' },
    { id: 'TCHR0593', name: '컴퓨터교육론', credits: 3, practice: false, year: 2, semester: 2, field: '필수' },
    // 3학년 1학기
    { id: 'COED0208', name: '빅데이터 분석 개론', credits: 3, practice: false, year: 3, semester: 1, field: null },
    { id: 'COED0209', name: 'AI융합 프로그래밍 실습', credits: 3, practice: true, year: 3, semester: 1, field: null },
    { id: 'MOBI0222', name: '머신러닝', credits: 3, practice: false, year: 3, semester: 1, field: '2' },
    { id: 'MOBI0224', name: '딥러닝', credits: 3, practice: false, year: 3, semester: 1, field: null },
    { id: 'TCHR0597', name: '컴퓨터 교육과정과 평가', credits: 3, practice: false, year: 3, semester: 1, field: '필수' },
    // 3학년 2학기
    { id: 'COED0210', name: '컴퓨터 네트워크 기초', credits: 3, practice: false, year: 3, semester: 2, field: '4' },
    { id: 'COED0211', name: 'IoT 프로그래밍', credits: 3, practice: true, year: 3, semester: 2, field: null },
    { id: 'COED0212', name: '인공지능 융합교육론', credits: 3, practice: false, year: 3, semester: 2, field: null },
    { id: 'COMP0312', name: '운영체제', credits: 3, practice: false, year: 3, semester: 2, field: '4' },
    { id: 'COMP0422', name: '소프트웨어공학', credits: 3, practice: false, year: 3, semester: 2, field: '6' },
    // 4학년 1학기
    { id: 'COED0213', name: '수업과 소프트웨어 활용', credits: 3, practice: false, year: 4, semester: 1, field: null },
    { id: 'COED0214', name: '교육용 멀티미디어', credits: 3, practice: false, year: 4, semester: 1, field: null },
    { id: 'TCHR0594', name: '컴퓨터교재연구및지도법', credits: 3, practice: false, year: 4, semester: 1, field: '필수' },
    // 4학년 2학기
    { id: 'COED0215', name: '인공지능 융합수업 설계', credits: 3, practice: false, year: 4, semester: 2, field: null },
    { id: 'COED0216', name: '교육용 소프트웨어 개발', credits: 3, practice: false, year: 4, semester: 2, field: null },
  ];

  const TEACHING_COURSES = [
    // 교직이론 (6과목, 12학점)
    { id: 'TCHR0611', name: '교육학개론', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0609', name: '교육철학 및 교육사', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0601', name: '교육과정', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0610', name: '교육평가', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0604', name: '교육방법 및 교육공학', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0607', name: '교육심리', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0606', name: '교육사회', credits: 2, practice: false, area: '교직이론' },
    { id: 'TCHR0612', name: '교육행정 및 교육경영', credits: 2, practice: false, area: '교직이론' },
    // 교직소양 (4과목, 6학점)
    { id: 'TCHR0528', name: '특수교육학개론', credits: 2, practice: false, area: '교직소양' },
    { id: 'TCHR0521', name: '교직실무 1', credits: 1, practice: false, area: '교직소양' },
    { id: 'TCHR0520', name: '생활지도및상담(교직소양)', credits: 2, practice: false, area: '교직소양' },
    { id: 'TCHR0553', name: '디지털 교육', credits: 1, practice: false, area: '교직소양' },
    // 교육실습 (2과목, 4학점)
    { id: 'TCHR0522', name: '학교현장실습', credits: 2, practice: true, area: '교육실습' },
    { id: 'TCHR0552', name: '교육봉사활동 2', credits: 2, practice: true, area: '교육실습' },
  ];

  const ALL_COURSES = [...MAJOR_COURSES, ...TEACHING_COURSES];
  const ALL_COURSES_MAP = new Map(ALL_COURSES.map(c => [c.id, c]));
  const MAJOR_IDS = new Set(MAJOR_COURSES.map(c => c.id));

  // Requirement thresholds (사용자 개선 요청 반영)
  const REQUIREMENTS = {
    majorTotalCredits: 60,
    majorRequiredCount: 4,
    majorFieldsNeeded: ['2', '3', '4', '5', '6'],
    teachingTotalCredits: 22,
    teachingTheoryCredits: 12,  // 6과목 * 2학점
    teachingCultureCredits: 6,  // 4과목 (2+1+2+1)
    teachingPracticeCredits: 4, // 2과목 (2+2)
  };

  const SEMESTERS = [
    { key: '1-1', label: '1학년 1학기' },
    { key: '1-2', label: '1학년 2학기' },
    { key: '2-1', label: '2학년 1학기' },
    { key: '2-2', label: '2학년 2학기' },
    { key: '3-1', label: '3학년 1학기' },
    { key: '3-2', label: '3학년 2학기' },
    { key: '4-1', label: '4학년 1학기' },
    { key: '4-2', label: '4학년 2학기' },
  ];

  // ───────── Grade Scale ─────────

  const GRADE_SCALE = {
    'A+': 4.3, 'A0': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B0': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C0': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D0': 1.0, 'D-': 0.7,
    'F': 0.0,
    'S': null, // Pass - credits count, no GPA impact
    'U': null, // Fail - no credits, no GPA impact
  };

  const GRADE_OPTIONS = ['A+','A0','A-','B+','B0','B-','C+','C0','C-','D+','D0','D-','F','S','U'];

  // ───────── State ─────────

  const STORAGE_KEY = 'grad-calc-v4';
  // takenMap: { [courseId]: semesterKey (e.g. '1-1') }
  let takenMap = {};
  // gradesMap: { [courseId]: gradeString (e.g. 'A+', 'B0', 'S') }
  let gradesMap = {};
  // customCourses: array of { id, semester, type, name, credits }
  let customCourses = [];
  let currentRecTab = 'major'; // 'major' or 'teaching'
  let editingSemester = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        takenMap = data.takenMap || {};
        gradesMap = data.gradesMap || {};
        customCourses = data.customCourses || [];
      }
    } catch {
      takenMap = {};
      gradesMap = {};
      customCourses = [];
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      takenMap,
      gradesMap,
      customCourses,
    }));
  }

  function setCourseSemester(courseId, semKey) {
    if (semKey) {
      takenMap[courseId] = semKey;
    } else {
      delete takenMap[courseId];
    }
    saveState();
    renderAll();
  }

  function resetAll() {
    takenMap = {};
    gradesMap = {};
    customCourses = [];
    saveState();
    renderAll();
  }

  // ───────── Computation Engine ─────────

  function computeStatus() {
    let majorCredits = 0;
    let majorRequiredTaken = 0;
    const fieldTaken = { '2': false, '3': false, '4': false, '5': false, '6': false };

    let teachingCredits = 0;
    let theoryCredits = 0;
    let cultureCredits = 0;
    let practiceCredits = 0;

    let theoryCount = 0;
    let cultureCount = 0;
    let practiceCount = 0;

    // For total credits and GPA
    let totalCredits = 0;
    let gpaWeightedSum = 0;
    let gpaCreditsSum = 0;

    // Per-semester stats
    const semesterStats = {};
    for (const sem of SEMESTERS) {
      semesterStats[sem.key] = { credits: 0, gpaSum: 0, gpaCredits: 0 };
    }

    // Helper to process a course's grade for credits/GPA
    function processCourseGrade(courseId, credits, semKey) {
      const grade = gradesMap[courseId];
      const stats = semesterStats[semKey];

      if (grade === 'F') {
        // F: credits NOT counted, but GPA IS affected (0.0)
        gpaWeightedSum += 0.0 * credits;
        gpaCreditsSum += credits;
        if (stats) {
          stats.gpaSum += 0.0 * credits;
          stats.gpaCredits += credits;
        }
        return 0; // no credits earned
      } else if (grade === 'U') {
        // U: no credits, no GPA impact
        return 0;
      } else if (grade === 'S') {
        // S: credits count, no GPA impact
        if (stats) {
          stats.credits += credits;
        }
        return credits;
      } else if (grade && GRADE_SCALE[grade] !== undefined && GRADE_SCALE[grade] !== null) {
        // Normal grade: credits count, GPA affected
        const gpaVal = GRADE_SCALE[grade];
        gpaWeightedSum += gpaVal * credits;
        gpaCreditsSum += credits;
        if (stats) {
          stats.credits += credits;
          stats.gpaSum += gpaVal * credits;
          stats.gpaCredits += credits;
        }
        return credits;
      } else {
        // No grade assigned: credits counted normally, excluded from GPA
        if (stats) {
          stats.credits += credits;
        }
        return credits;
      }
    }

    // Process system courses (from takenMap)
    for (const [id, semKey] of Object.entries(takenMap)) {
      if (!semKey) continue;
      const course = ALL_COURSES_MAP.get(id);
      if (!course) continue;

      const earnedCredits = processCourseGrade(id, course.credits, semKey);
      totalCredits += earnedCredits;

      if (MAJOR_IDS.has(id)) {
        majorCredits += earnedCredits;
        if (course.field === '필수' && earnedCredits > 0) majorRequiredTaken++;
        if (course.field && fieldTaken.hasOwnProperty(course.field) && earnedCredits > 0) {
          fieldTaken[course.field] = true;
        }
      } else {
        teachingCredits += earnedCredits;
        if (course.area === '교직이론' && earnedCredits > 0) {
          theoryCredits += earnedCredits;
          theoryCount++;
        }
        if (course.area === '교직소양' && earnedCredits > 0) {
          cultureCredits += earnedCredits;
          cultureCount++;
        }
        if (course.area === '교육실습' && earnedCredits > 0) {
          practiceCredits += earnedCredits;
          practiceCount++;
        }
      }
    }

    // Process custom courses
    for (const cc of customCourses) {
      const earnedCredits = processCourseGrade(cc.id, cc.credits, cc.semester);
      totalCredits += earnedCredits;

      if (cc.type === '전공') {
        majorCredits += earnedCredits;
      } else if (cc.type === '교직') {
        teachingCredits += earnedCredits;
      }
    }

    const teachingTotalCount = theoryCount + cultureCount + practiceCount;

    const fieldsMetCount = Object.values(fieldTaken).filter(Boolean).length;
    const majorCreditsMet = majorCredits >= REQUIREMENTS.majorTotalCredits;
    const majorRequiredMet = majorRequiredTaken >= REQUIREMENTS.majorRequiredCount;
    const allFieldsMet = fieldsMetCount >= REQUIREMENTS.majorFieldsNeeded.length;

    const teachingCreditsMet = teachingCredits >= REQUIREMENTS.teachingTotalCredits;
    const theoryMet = theoryCredits >= REQUIREMENTS.teachingTheoryCredits;
    const cultureMet = cultureCredits >= REQUIREMENTS.teachingCultureCredits;
    const practiceMet = practiceCredits >= REQUIREMENTS.teachingPracticeCredits;

    const totalGPA = gpaCreditsSum > 0 ? gpaWeightedSum / gpaCreditsSum : 0;
    const totalCreditsMet = totalCredits >= 140;

    const allRequirementsMet =
      majorCreditsMet && majorRequiredMet && allFieldsMet &&
      teachingCreditsMet && theoryMet && cultureMet && practiceMet &&
      totalCreditsMet;

    return {
      majorCredits, majorRequiredTaken, fieldTaken, fieldsMetCount,
      teachingCredits, theoryCredits, cultureCredits, practiceCredits,
      theoryCount, cultureCount, practiceCount, teachingTotalCount,
      majorCreditsMet, majorRequiredMet, allFieldsMet,
      teachingCreditsMet, theoryMet, cultureMet, practiceMet,
      totalCredits, totalGPA, totalCreditsMet, semesterStats,
      allRequirementsMet,
    };
  }

  // ───────── DOM Helpers ─────────

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ───────── Render Functions ─────────

  function renderAll() {
    const status = computeStatus();
    renderDashboard(status);
    renderLeftSemesters();
    renderRightRecommended();
    renderGraduationBanner(status);
  }

  // Dashboard Summary
  function renderDashboard(status) {
    // Total Credits
    $('#total-credits-val').textContent = status.totalCredits;
    const totalPct = Math.min((status.totalCredits / 140) * 100, 100);
    $('#total-credits-bar').style.width = totalPct + '%';
    $('#card-total-credits').classList.toggle('met', status.totalCreditsMet);
    $('#total-gpa-display').textContent = `총 평점 ${status.totalGPA.toFixed(2)}`;

    // Major Credits
    $('#major-credits-val').textContent = status.majorCredits;
    const majorPct = Math.min((status.majorCredits / REQUIREMENTS.majorTotalCredits) * 100, 100);
    $('#major-credits-bar').style.width = majorPct + '%';
    $('#card-major-credits').classList.toggle('met', status.majorCreditsMet);

    // Fields & Required Badges
    const fieldBadgesContainer = $('#field-badges-container');
    fieldBadgesContainer.innerHTML = '';

    // 필수 요건 뱃지 추가
    const reqBadge = document.createElement('span');
    reqBadge.className = `badge-item ${status.majorRequiredMet ? 'met' : 'unmet'}`;
    reqBadge.textContent = `필수 ${status.majorRequiredTaken}/${REQUIREMENTS.majorRequiredCount}`;
    fieldBadgesContainer.appendChild(reqBadge);

    // 기존 분야별 뱃지 추가
    for (const f of REQUIREMENTS.majorFieldsNeeded) {
      const met = status.fieldTaken[f];
      const badge = document.createElement('span');
      badge.className = `badge-item ${met ? 'met' : 'unmet'}`;
      badge.textContent = `(${f}) ${met ? '이수' : '미이수'}`;
      fieldBadgesContainer.appendChild(badge);
    }
    $('#card-fields').classList.toggle('met', status.allFieldsMet && status.majorRequiredMet);

    // Teaching Credits
    $('#teaching-credits-val').textContent = status.teachingCredits;
    const teachPct = Math.min((status.teachingCredits / REQUIREMENTS.teachingTotalCredits) * 100, 100);
    $('#teaching-credits-bar').style.width = teachPct + '%';
    $('#card-teaching-credits').classList.toggle('met', status.teachingCreditsMet);

    // Teaching Areas
    const teachingBadgesContainer = $('#teaching-badges-container');
    teachingBadgesContainer.innerHTML = `
      <span class="badge-item ${status.theoryMet ? 'met' : 'unmet'}">이론 ${status.theoryCount}/6</span>
      <span class="badge-item ${status.cultureMet ? 'met' : 'unmet'}">소양 ${status.cultureCount}/4</span>
      <span class="badge-item ${status.practiceMet ? 'met' : 'unmet'}">실습 ${status.practiceCount}/2</span>
    `;
    const allTeachAreasMet = status.theoryMet && status.cultureMet && status.practiceMet;
    $('#card-teaching-areas').classList.toggle('met', allTeachAreasMet);
  }

  // Left Column: Real Semesters Grid (1-1 ~ 4-2)
  function renderLeftSemesters() {
    const container = $('#semesters-grid');
    container.innerHTML = '';
    const status = computeStatus();

    for (const sem of SEMESTERS) {
      const box = document.createElement('div');
      box.className = 'semester-box';
      box.dataset.sem = sem.key;

      // Find system courses assigned to this semester
      const assignedIds = Object.keys(takenMap).filter(id => takenMap[id] === sem.key);
      const assignedCourses = assignedIds.map(id => ALL_COURSES_MAP.get(id)).filter(Boolean);
      // Find custom courses assigned to this semester
      const semCustomCourses = customCourses.filter(cc => cc.semester === sem.key);

      // Semester stats
      const semStats = status.semesterStats[sem.key] || { credits: 0, gpaSum: 0, gpaCredits: 0 };
      const semGPA = semStats.gpaCredits > 0 ? (semStats.gpaSum / semStats.gpaCredits).toFixed(2) : '-';

      const header = document.createElement('div');
      header.className = 'semester-box-header';
      header.innerHTML = `
        <span class="semester-box-title">${sem.label}</span>
        <div class="semester-header-info">
          <span class="semester-box-credits">${semStats.credits}학점</span>
          <span class="semester-gpa">· ${semGPA}</span>
          <button class="btn btn-sm btn-edit-semester" type="button" data-sem="${sem.key}">수정</button>
        </div>
      `;
      box.appendChild(header);

      const list = document.createElement('div');
      list.className = 'semester-course-list';

      const allEmpty = assignedCourses.length === 0 && semCustomCourses.length === 0;

      if (allEmpty) {
        list.innerHTML = `<div class="empty-drop-zone">과목을 이곳으로 드래그하세요</div>`;
      } else {
        for (const c of assignedCourses) {
          list.appendChild(createCourseCard(c, 'left'));
        }
        for (const cc of semCustomCourses) {
          list.appendChild(createCustomCourseCard(cc));
        }
      }

      box.appendChild(list);

      // Edit button handler
      const editBtn = header.querySelector('.btn-edit-semester');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingSemester = sem.key;
        renderSemesterEditModal(sem.key);
        const dialog = $('#semester-edit-dialog');
        const semLabel = SEMESTERS.find(s => s.key === sem.key)?.label || sem.key;
        $('#semester-edit-title').textContent = semLabel + ' 수정';
        dialog.showModal();
      });

      // Drag & Drop event listeners for semester box
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        box.classList.add('drag-over');
      });

      box.addEventListener('dragleave', (e) => {
        if (!box.contains(e.relatedTarget)) {
          box.classList.remove('drag-over');
        }
      });

      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('drag-over');
        const courseId = e.dataTransfer.getData('text/plain');
        if (courseId && ALL_COURSES_MAP.has(courseId)) {
          setCourseSemester(courseId, sem.key);
        }
      });

      container.appendChild(box);
    }
  }

  // Create a card for a custom course in a semester box
  // Create a card for a custom course in a semester box
  function createCustomCourseCard(cc) {
    const card = document.createElement('div');
    card.className = 'course-card-compact';

    card.innerHTML = `
      <span class="compact-name">${cc.name}</span>
      <span class="custom-type-badge">${cc.type}</span>
      <span class="tag tag-credits">${cc.credits}학점</span>
      <button class="remove-course-btn" type="button" title="삭제">✕</button>
    `;

    const removeBtn = card.querySelector('.remove-course-btn');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      customCourses = customCourses.filter(c => c.id !== cc.id);
      delete gradesMap[cc.id];
      saveState();
      renderAll();
    });

    return card;
  }

  // Right Column: Recommended / Uncompleted Courses Panel
  function renderRightRecommended() {
    const container = $('#recommended-content');
    container.innerHTML = '';

    // Drag back to right panel area (cancels semester assignment)
    const panel = $('#recommended-panel');
    panel.ondragover = (e) => {
      e.preventDefault();
    };
    panel.ondrop = (e) => {
      e.preventDefault();
      const courseId = e.dataTransfer.getData('text/plain');
      if (courseId && takenMap[courseId]) {
        setCourseSemester(courseId, null);
      }
    };

    if (currentRecTab === 'major') {
      // Group by recommended semester
      const groups = {};
      for (const c of MAJOR_COURSES) {
        const key = `${c.year}-${c.semester}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
      }

      const keys = Object.keys(groups).sort();
      for (const key of keys) {
        const [yr, sem] = key.split('-');
        const groupEl = document.createElement('div');
        groupEl.className = 'rec-course-group';

        const title = document.createElement('div');
        title.className = 'rec-section-title';
        title.textContent = `${yr}학년 ${sem}학기 권장`;
        groupEl.appendChild(title);

        for (const c of groups[key]) {
          groupEl.appendChild(createCourseCard(c, 'right'));
        }
        container.appendChild(groupEl);
      }
    } else {
      // Teaching Courses grouped by area
      const status = computeStatus();
      const areaInfo = [
        { name: '교직이론', count: status.theoryCount, req: 6 },
        { name: '교직소양', count: status.cultureCount, req: 4 },
        { name: '교육실습', count: status.practiceCount, req: 2 },
      ];

      for (const area of areaInfo) {
        const courses = TEACHING_COURSES.filter(c => c.area === area.name);
        const groupEl = document.createElement('div');
        groupEl.className = 'rec-course-group';

        const title = document.createElement('div');
        title.className = 'rec-section-title';
        title.textContent = `${area.name} (${area.count}/${area.req}과목 수강)`;
        groupEl.appendChild(title);

        for (const c of courses) {
          groupEl.appendChild(createCourseCard(c, 'right'));
        }
        container.appendChild(groupEl);
      }
    }
  }

  // Create Course Card Component
  function createCourseCard(course, side) {
    const card = document.createElement('div');
    const isAssigned = Boolean(takenMap[course.id]);
    const rightAssigned = side === 'right' && isAssigned ? ' assigned' : '';
    card.className = `course-card${side === 'left' ? ' in-semester' : rightAssigned}`;
    card.draggable = true;
    card.dataset.id = course.id;

    // Badges HTML
    let tagsHTML = '';
    if (course.field === '필수') {
      tagsHTML += `<span class="tag tag-required">필수</span>`;
    } else if (course.field) {
      tagsHTML += `<span class="tag tag-field">(${course.field})</span>`;
    }
    // 사용자 개선 요청: "실습"으로 단독 표시 및 교직영역 간략화
    if (course.practice && course.area !== '교육실습') {
      tagsHTML += `<span class="tag tag-practice">실습</span>`;
    }
    if (course.area) {
      tagsHTML += `<span class="tag tag-teaching">교직</span>`;
      let areaLabel = course.area;
      if (areaLabel === '교직이론') areaLabel = '이론';
      if (areaLabel === '교직소양') areaLabel = '소양';
      if (areaLabel === '교육실습') areaLabel = '실습';
      const tagClass = areaLabel === '실습' ? 'tag-practice' : 'tag-area';
      tagsHTML += `<span class="tag ${tagClass}">${areaLabel}</span>`;
    }
    tagsHTML += `<span class="tag tag-credits">${course.credits}학점</span>`;

    // Action button / Quick dropdown
    let actionHTML = '';
    if (side === 'left') {
      actionHTML = `<button class="remove-course-btn" type="button" title="이수 취소">✕</button>`;
    } else {
      if (isAssigned) {
        actionHTML = `<span class="tag tag-practice" style="font-size: 0.68rem;">✓ ${takenMap[course.id]} 이수중</span>`;
      } else {
        // Quick Semester Select Options
        let optionsHTML = '<option value="">+ 이수 학기</option>';
        for (const sem of SEMESTERS) {
          optionsHTML += `<option value="${sem.key}">${sem.key}학기</option>`;
        }
        actionHTML = `<select class="semester-select-btn">${optionsHTML}</select>`;
      }
    }

    card.innerHTML = `
      <div class="course-header-row">
        <div class="course-title">${course.name}</div>
        ${side === 'left' ? actionHTML : ''}
      </div>
      <div class="course-footer-row">
        <div class="course-badges">
          <span class="course-code">${course.id}</span>
          ${tagsHTML}
        </div>
        ${side === 'right' ? actionHTML : ''}
      </div>
    `;

    // Event Listeners
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', course.id);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    // Remove button click
    const removeBtn = card.querySelector('.remove-course-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setCourseSemester(course.id, null);
      });
    }

    // Quick select dropdown change
    const selectEl = card.querySelector('.semester-select-btn');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          setCourseSemester(course.id, val);
        }
      });
    }

    return card;
  }

  // Graduation Banner
  function renderGraduationBanner(status) {
    const banner = $('#graduation-banner');
    const bannerTitle = $('#banner-title');
    const bannerDesc = $('#banner-desc');

    if (status.allRequirementsMet) {
      banner.className = 'graduation-banner met';
      bannerTitle.textContent = '🎓 모든 졸업 요건을 충족했습니다!';
      bannerDesc.textContent = `총 ${status.totalCredits}/140학점 · 전공 60학점(필수 4과목, (2)~(6) 분야) 및 교직 22학점(이론 12, 소양 6, 실습 4) 이수가 모두 완료되었습니다.`;
    } else {
      banner.className = 'graduation-banner';
      const parts = [];
      if (!status.totalCreditsMet) parts.push(`총 학점 ${140 - status.totalCredits}학점 부족 (${status.totalCredits}/140)`);
      if (!status.majorCreditsMet) parts.push(`전공 ${REQUIREMENTS.majorTotalCredits - status.majorCredits}학점 부족`);
      if (!status.majorRequiredMet) parts.push(`필수 ${REQUIREMENTS.majorRequiredCount - status.majorRequiredTaken}과목 부족`);
      if (!status.allFieldsMet) {
        const missing = REQUIREMENTS.majorFieldsNeeded.filter(f => !status.fieldTaken[f]);
        parts.push(`분야 (${missing.join(',')}) 미이수`);
      }
      if (!status.teachingCreditsMet) parts.push(`교직 ${REQUIREMENTS.teachingTotalCredits - status.teachingCredits}학점 부족`);
      if (!status.theoryMet) parts.push(`교직이론 ${REQUIREMENTS.teachingTheoryCredits - status.theoryCredits}학점 부족`);
      if (!status.cultureMet) parts.push(`교직소양 ${REQUIREMENTS.teachingCultureCredits - status.cultureCredits}학점 부족`);
      if (!status.practiceMet) parts.push(`교육실습 ${REQUIREMENTS.teachingPracticeCredits - status.practiceCredits}학점 부족`);

      bannerTitle.textContent = '졸업 요건 미충족';
      bannerDesc.textContent = parts.length > 0 ? parts.join(' · ') : '과목을 이수 학기 상자로 드래그하거나 선택하세요.';
    }
  }

  // Field Details Modal Rendering
  function renderFieldDetailsTable() {
    const tbody = $('#field-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const status = computeStatus();

    const groups = [
      { key: '필수', label: '필수' },
      { key: '2', label: '(2)' },
      { key: '3', label: '(3)' },
      { key: '4', label: '(4)' },
      { key: '5', label: '(5)' },
      { key: '6', label: '(6)' },
    ];

    groups.forEach(g => {
      const courses = MAJOR_COURSES.filter(c => c.field === g.key);
      if (courses.length === 0) return;

      const isGroupMet = (g.key === '필수') ? status.majorRequiredMet : status.fieldTaken[g.key];
      const metClass = isGroupMet ? ' met' : '';

      courses.forEach((c, idx) => {
        const tr = document.createElement('tr');
        
        let html = '';
        if (idx === 0) {
          html += `<td rowspan="${courses.length}" class="field-label${metClass}">${g.label}</td>`;
        }
        
        const isMet = !!takenMap[c.id];
        const badgeHTML = isMet ? `<span class="course-completed-badge">이수</span>` : '';

        html += `
          <td>${c.year}-${c.semester}</td>
          <td class="course-name-cell">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${c.name}</span>
              <span class="course-code" style="margin-top: 0;">${c.id}</span>
            </div>
            ${badgeHTML}
          </td>
        `;
        tr.innerHTML = html;
        tbody.appendChild(tr);
      });
    });
  }

  // Teaching Details Modal Rendering
  function renderTeachingDetailsTable() {
    const tbody = $('#teaching-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const status = computeStatus();

    const groups = [
      { key: '교직이론', label: '교직이론', isMet: status.theoryMet, count: status.theoryCount, req: 6 },
      { key: '교직소양', label: '교직소양', isMet: status.cultureMet, count: status.cultureCount, req: 4 },
      { key: '교육실습', label: '교육실습', isMet: status.practiceMet, count: status.practiceCount, req: 2 },
    ];

    groups.forEach(g => {
      const courses = TEACHING_COURSES.filter(c => c.area === g.key);
      if (courses.length === 0) return;

      const metClass = g.isMet ? ' met' : '';

      courses.forEach((c, idx) => {
        const tr = document.createElement('tr');
        
        let html = '';
        if (idx === 0) {
          html += `<td rowspan="${courses.length}" class="field-label${metClass}">
            <div>${g.label}</div>
            <div style="font-size: 0.8rem; font-weight: normal; opacity: 0.85; margin-top: 2px;">${g.count}/${g.req}</div>
          </td>`;
        }
        
        const isMet = !!takenMap[c.id];
        const badgeHTML = isMet ? `<span class="course-completed-badge">이수</span>` : '';

        html += `
          <td class="course-name-cell">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${c.name}</span>
              <span class="course-code" style="margin-top: 0;">${c.id}</span>
            </div>
            ${badgeHTML}
          </td>
        `;
        tr.innerHTML = html;
        tbody.appendChild(tr);
      });
    });
  }

  // ───────── Semester Edit Modal ─────────

  function buildGradeSelect(courseId) {
    const currentGrade = gradesMap[courseId] || '';
    let html = `<select class="grade-select" data-course-id="${courseId}">`;
    html += `<option value="">성적 선택</option>`;
    for (const g of GRADE_OPTIONS) {
      const sel = currentGrade === g ? ' selected' : '';
      html += `<option value="${g}"${sel}>${g}</option>`;
    }
    html += `</select>`;
    return html;
  }

  function renderSemesterEditModal(semKey) {
    const body = $('#semester-edit-body');
    body.innerHTML = '';

    // Section 1: 기존 과목 성적 -> 전공/교직
    const section1 = document.createElement('div');
    section1.className = 'semester-edit-section';
    section1.innerHTML = `<div class="semester-edit-section-title">전공/교직</div>`;
    const list1 = document.createElement('div');
    list1.className = 'semester-edit-list';

    const assignedIds = Object.keys(takenMap).filter(id => takenMap[id] === semKey);
    const assignedCourses = assignedIds.map(id => ALL_COURSES_MAP.get(id)).filter(Boolean);

    if (assignedCourses.length === 0) {
      list1.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-dim); padding: 8px;">이 학기에 배치된 과목이 없습니다.</div>`;
    } else {
      for (const c of assignedCourses) {
        const row = document.createElement('div');
        row.className = 'semester-edit-row';
        row.innerHTML = `
          <span class="course-name">${c.name}</span>
          <span class="course-credits-label">${c.credits}학점</span>
          ${buildGradeSelect(c.id)}
          <button class="btn-delete-custom" type="button" data-course-id="${c.id}" title="이수 취소">✕</button>
        `;
        list1.appendChild(row);
      }
    }
    section1.appendChild(list1);
    body.appendChild(section1);

    // Section 2: 추가된 과목 -> 교양/일반선택
    const semCustom = customCourses.filter(cc => cc.semester === semKey);
    const section2 = document.createElement('div');
    section2.className = 'semester-edit-section';
    section2.innerHTML = `<div class="semester-edit-section-title">교양/일반선택</div>`;
    const list2 = document.createElement('div');
    list2.className = 'semester-edit-list';

    if (semCustom.length === 0) {
      list2.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-dim); padding: 8px;">추가된 과목이 없습니다.</div>`;
    } else {
      for (const cc of semCustom) {
        const row = document.createElement('div');
        row.className = 'semester-edit-row';
        row.innerHTML = `
          <span class="custom-type-badge">${cc.type}</span>
          <span class="course-name">${cc.name}</span>
          <span class="course-credits-label">${cc.credits}학점</span>
          ${buildGradeSelect(cc.id)}
          <button class="btn-delete-custom" type="button" data-custom-id="${cc.id}" title="삭제">✕</button>
        `;
        list2.appendChild(row);
      }
    }
    section2.appendChild(list2);
    body.appendChild(section2);

    // Section 3: 과목 추가 폼
    const section3 = document.createElement('div');
    section3.className = 'semester-edit-section';
    section3.innerHTML = `<div class="semester-edit-section-title">과목 추가</div>`;
    const form = document.createElement('div');
    form.className = 'add-course-form';
    form.innerHTML = `
      <select id="add-course-type">
        <option value="전공">전공</option>
        <option value="교직">교직</option>
        <option value="교양">교양</option>
        <option value="일반선택">일반선택</option>
      </select>
      <span id="add-course-name-container"></span>
      <input type="number" id="add-course-credits" placeholder="학점" min="1" max="6" value="3" style="width: 60px;">
      <select id="add-course-grade">
        <option value="">성적 선택</option>
        ${GRADE_OPTIONS.map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
      <button class="btn-add" id="btn-add-course" type="button">추가</button>
    `;
    section3.appendChild(form);
    body.appendChild(section3);

    // Initialize the course name field based on type
    updateAddCourseNameField();

    // Event: type change
    body.querySelector('#add-course-type').addEventListener('change', updateAddCourseNameField);

    // Event: grade changes on existing courses
    body.querySelectorAll('.grade-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const cid = e.target.dataset.courseId;
        const val = e.target.value;
        if (val) {
          gradesMap[cid] = val;
        } else {
          delete gradesMap[cid];
        }
        saveState();
        renderAll();
      });
    });

    // Event: delete course (system or custom)
    body.querySelectorAll('.btn-delete-custom').forEach(btn => {
      btn.addEventListener('click', () => {
        const customId = btn.dataset.customId;
        const courseId = btn.dataset.courseId;
        if (customId) {
          customCourses = customCourses.filter(c => c.id !== customId);
          delete gradesMap[customId];
        } else if (courseId) {
          delete takenMap[courseId];
          delete gradesMap[courseId];
        }
        saveState();
        renderAll();
        renderSemesterEditModal(semKey);
      });
    });

    // Event: add course
    body.querySelector('#btn-add-course').addEventListener('click', () => {
      const type = body.querySelector('#add-course-type').value;
      const creditsInput = body.querySelector('#add-course-credits');
      const gradeSelect = body.querySelector('#add-course-grade');
      const grade = gradeSelect.value;

      if (type === '전공' || type === '교직') {
        const nameSelect = body.querySelector('#add-course-name-select');
        if (!nameSelect || !nameSelect.value) return;
        const courseId = nameSelect.value;
        takenMap[courseId] = semKey;
        if (grade) gradesMap[courseId] = grade;
      } else {
        const nameInput = body.querySelector('#add-course-name-input');
        if (!nameInput || !nameInput.value.trim()) return;
        const credits = parseInt(creditsInput.value) || 3;
        const cc = {
          id: `custom-${Date.now()}`,
          semester: semKey,
          type: type,
          name: nameInput.value.trim(),
          credits: credits,
        };
        customCourses.push(cc);
        if (grade) gradesMap[cc.id] = grade;
      }

      saveState();
      renderAll();
      renderSemesterEditModal(semKey);
    });
  }

  function updateAddCourseNameField() {
    const type = $('#add-course-type')?.value;
    const container = $('#add-course-name-container');
    const creditsInput = $('#add-course-credits');
    if (!container) return;

    if (type === '전공' || type === '교직') {
      const courses = type === '전공' ? MAJOR_COURSES : TEACHING_COURSES;
      const available = courses.filter(c => !takenMap[c.id]);
      let html = `<select id="add-course-name-select">`;
      html += `<option value="">과목 선택</option>`;
      for (const c of available) {
        html += `<option value="${c.id}" data-credits="${c.credits}">${c.name} (${c.id})</option>`;
      }
      html += `</select>`;
      container.innerHTML = html;

      // Auto-fill credits on selection
      const sel = container.querySelector('#add-course-name-select');
      sel.addEventListener('change', () => {
        const opt = sel.selectedOptions[0];
        if (opt && opt.dataset.credits) {
          creditsInput.value = opt.dataset.credits;
          creditsInput.readOnly = true;
        } else {
          creditsInput.readOnly = false;
        }
      });
      creditsInput.readOnly = false;
    } else {
      container.innerHTML = `<input type="text" id="add-course-name-input" placeholder="과목명">`;
      creditsInput.readOnly = false;
    }
  }

  // Init Events & Controls
  function initEvents() {
    // Recommended Tab navigation
    $$('.rec-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.rec-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRecTab = btn.dataset.tab;
        renderRightRecommended();
      });
    });

    // Reset Dialog
    const dialog = $('#reset-dialog');
    $('#btn-reset').addEventListener('click', () => dialog.showModal());
    $('#dialog-cancel').addEventListener('click', () => dialog.close());
    $('#dialog-confirm').addEventListener('click', () => {
      dialog.close();
      resetAll();
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });

    // Field Details Dialog
    const fieldDialog = $('#field-details-dialog');
    if (fieldDialog) {
      $('#btn-field-details').addEventListener('click', () => {
        renderFieldDetailsTable();
        fieldDialog.showModal();
      });
      $('#field-dialog-close').addEventListener('click', () => fieldDialog.close());
      fieldDialog.addEventListener('click', (e) => {
        if (e.target === fieldDialog) fieldDialog.close();
      });
    }

    // Teaching Details Dialog
    const teachingDialog = $('#teaching-details-dialog');
    if (teachingDialog) {
      $('#btn-teaching-details').addEventListener('click', () => {
        renderTeachingDetailsTable();
        teachingDialog.showModal();
      });
      $('#teaching-dialog-close').addEventListener('click', () => teachingDialog.close());
      teachingDialog.addEventListener('click', (e) => {
        if (e.target === teachingDialog) teachingDialog.close();
      });
    }

    // Semester Edit Dialog
    const semDialog = $('#semester-edit-dialog');
    if (semDialog) {
      $('#semester-edit-close').addEventListener('click', () => semDialog.close());
      semDialog.addEventListener('click', (e) => {
        if (e.target === semDialog) semDialog.close();
      });
    }
  }

  function init() {
    loadState();
    initEvents();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
