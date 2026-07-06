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

  // ───────── State ─────────

  const STORAGE_KEY = 'grad-calc-semesters-v3';
  // takenMap: { [courseId]: semesterKey (e.g. '1-1') }
  let takenMap = {};
  let currentRecTab = 'major'; // 'major' or 'teaching'

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        takenMap = JSON.parse(raw);
      }
    } catch {
      takenMap = {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(takenMap));
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

    for (const [id, semKey] of Object.entries(takenMap)) {
      if (!semKey) continue;
      const course = ALL_COURSES_MAP.get(id);
      if (!course) continue;

      if (MAJOR_IDS.has(id)) {
        majorCredits += course.credits;
        if (course.field === '필수') majorRequiredTaken++;
        if (course.field && fieldTaken.hasOwnProperty(course.field)) {
          fieldTaken[course.field] = true;
        }
      } else {
        teachingCredits += course.credits;
        if (course.area === '교직이론') {
          theoryCredits += course.credits;
          theoryCount++;
        }
        if (course.area === '교직소양') {
          cultureCredits += course.credits;
          cultureCount++;
        }
        if (course.area === '교육실습') {
          practiceCredits += course.credits;
          practiceCount++;
        }
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

    const allRequirementsMet =
      majorCreditsMet && majorRequiredMet && allFieldsMet &&
      teachingCreditsMet && theoryMet && cultureMet && practiceMet;

    return {
      majorCredits, majorRequiredTaken, fieldTaken, fieldsMetCount,
      teachingCredits, theoryCredits, cultureCredits, practiceCredits,
      theoryCount, cultureCount, practiceCount, teachingTotalCount,
      majorCreditsMet, majorRequiredMet, allFieldsMet,
      teachingCreditsMet, theoryMet, cultureMet, practiceMet,
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
      <span class="badge-item ${status.theoryMet ? 'met' : 'unmet'}">이론 ${status.theoryCredits}/12</span>
      <span class="badge-item ${status.cultureMet ? 'met' : 'unmet'}">소양 ${status.cultureCredits}/6</span>
      <span class="badge-item ${status.practiceMet ? 'met' : 'unmet'}">실습 ${status.practiceCredits}/4</span>
    `;
    const allTeachAreasMet = status.theoryMet && status.cultureMet && status.practiceMet;
    $('#card-teaching-areas').classList.toggle('met', allTeachAreasMet);
  }

  // Left Column: Real Semesters Grid (1-1 ~ 4-2)
  function renderLeftSemesters() {
    const container = $('#semesters-grid');
    container.innerHTML = '';

    for (const sem of SEMESTERS) {
      const box = document.createElement('div');
      box.className = 'semester-box';
      box.dataset.sem = sem.key;

      // Find courses assigned to this semester
      const assignedIds = Object.keys(takenMap).filter(id => takenMap[id] === sem.key);
      const assignedCourses = assignedIds.map(id => ALL_COURSES_MAP.get(id)).filter(Boolean);
      const totalCredits = assignedCourses.reduce((s, c) => s + c.credits, 0);

      const header = document.createElement('div');
      header.className = 'semester-box-header';
      header.innerHTML = `
        <span class="semester-box-title">${sem.label}</span>
        <span class="semester-box-credits">${totalCredits} 학점</span>
      `;
      box.appendChild(header);

      const list = document.createElement('div');
      list.className = 'semester-course-list';

      if (assignedCourses.length === 0) {
        list.innerHTML = `<div class="empty-drop-zone">과목을 이곳으로 드래그하세요</div>`;
      } else {
        for (const c of assignedCourses) {
          list.appendChild(createCourseCard(c, 'left'));
        }
      }

      box.appendChild(list);

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
      bannerDesc.textContent = '전공 60학점(필수 4과목, (2)~(6) 분야) 및 교직 22학점(이론 12, 소양 6, 실습 4) 이수가 모두 완료되었습니다.';
    } else {
      banner.className = 'graduation-banner';
      const parts = [];
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
