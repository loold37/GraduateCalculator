import { store, saveState, setCourseSemester, resetAll, applyExcelData } from './state.js';
import { GEN_ED_AREA_REQUIREMENTS, REQUIREMENTS, GRADE_SCALE, computeStatus } from './calculator.js';
import { parseTranscriptExcel, mapExcelToSemesters } from './excel.js';

export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

export const SEMESTERS = [
    { key: '1-1', label: '1학년 1학기' },
    { key: '1-2', label: '1학년 2학기' },
    { key: '2-1', label: '2학년 1학기' },
    { key: '2-2', label: '2학년 2학기' },
    { key: '3-1', label: '3학년 1학기' },
    { key: '3-2', label: '3학년 2학기' },
    { key: '4-1', label: '4학년 1학기' },
    { key: '4-2', label: '4학년 2학기' },
  ];
export const GRADE_OPTIONS = ['A+','A0','A-','B+','B0','B-','C+','C0','C-','D+','D0','D-','F','S','U'];

export function updateMajorUI() {
    const majorConfig = store.MAJORS[store.currentMajor];
    const majorReqs = majorConfig.requirements;
    // Update header subtitle
    const subtitle = document.querySelector('.header-title-group p');
    if (subtitle) subtitle.textContent = `${majorConfig.name} · 전공 & 교직 이수 학기 관리 시스템`;
    // Update title
    const title = document.querySelector('title');
    if (title) title.textContent = `졸업요건 계산기 — ${majorConfig.name}`;
    // Update major credits max display
    const majorMax = document.querySelector('#major-credits-max');
    if (majorMax) majorMax.textContent = `/ ${majorReqs.majorTotalCredits}학점`;
    // Update select dropdown
    const selectEl = $('#major-select');
    if (selectEl) selectEl.value = store.currentMajor;
  }

export function renderAll() {
    const status = computeStatus({ currentMajor: store.currentMajor, MAJORS: store.MAJORS, SEMESTERS, gradesMap: store.gradesMap, takenMap: store.takenMap, customCourses: store.customCourses, ALL_COURSES_MAP: store.ALL_COURSES_MAP, MAJOR_IDS: store.MAJOR_IDS, genEdCourses: store.genEdCourses, mathScienceExempt: store.mathScienceExempt, GRADE_SCALE, REQUIREMENTS, GEN_ED_AREA_REQUIREMENTS });
    renderDashboard(status);
    renderLeftSemesters();
    renderRightRecommended();
    renderGraduationBanner(status);
  }

export function renderDashboard(status) {
    // Total Credits
    $('#total-credits-val').textContent = status.totalCredits;
    $('#card-total-credits').classList.toggle('met', status.totalCreditsMet);
    const totalGPATruncated = Math.floor(status.totalGPA * 100) / 100;
    $('#total-gpa-display').textContent = `총 평점 ${totalGPATruncated.toFixed(2)}`;

    const totalTrack = $('#total-credits-track');
    if (totalTrack) {
      totalTrack.style.display = 'flex';
      
      const capMajor = Math.min((status.majorCredits / 140) * 100, 100);
      const capTeach = Math.min((status.teachingCredits / 140) * 100, 100 - capMajor);
      const capGenEd = Math.min((status.genEdCredits / 140) * 100, 100 - capMajor - capTeach);
      const capElec = Math.min((status.electiveCredits / 140) * 100, 100 - capMajor - capTeach - capGenEd);

      const segments = [
        { width: capMajor, color: 'var(--accent-primary)', title: `전공 ${status.majorCredits}학점` },
        { width: capTeach, color: '#f59e0b', title: `교직 ${status.teachingCredits}학점` },
        { width: capGenEd, color: '#10b981', title: `교양 ${status.genEdCredits}학점` },
        { width: capElec, color: '#8b5cf6', title: `일반선택 ${status.electiveCredits}학점` }
      ].filter(s => s.width > 0);

      let segmentsHtml = '';
      segments.forEach((seg, i) => {
        let radiusStyle = '';
        if (i === 0) radiusStyle += 'border-top-left-radius: var(--radius-full); border-bottom-left-radius: var(--radius-full); ';
        if (i === segments.length - 1) radiusStyle += 'border-top-right-radius: var(--radius-full); border-bottom-right-radius: var(--radius-full); ';
        segmentsHtml += `<div style="height: 100%; width: ${seg.width}%; background-color: ${seg.color}; ${radiusStyle}" title="${seg.title}"></div>`;
      });
      totalTrack.innerHTML = segmentsHtml;
    }

    // Major Credits
    const majorReqs = status.majorReqs;
    $('#major-credits-val').textContent = status.majorCredits;
    const majorPct = Math.min((status.majorCredits / majorReqs.majorTotalCredits) * 100, 100);
    $('#major-credits-bar').style.width = majorPct + '%';

    // Update max credits display
    const majorMax = $('#major-credits-max');
    if (majorMax) majorMax.textContent = `/ ${majorReqs.majorTotalCredits}학점`;

    // Major GPA & Score display
    const majorGPATruncated = Math.floor(status.majorGPA * 100) / 100;
    const majorGpaDisplay = $('#major-gpa-display');
    if (majorGpaDisplay) {
      majorGpaDisplay.textContent = `평점 ${majorGPATruncated.toFixed(2)} (${status.majorScore}/75점)`;
      majorGpaDisplay.style.color = status.majorScoreMet ? 'var(--text-muted)' : 'var(--danger)';
    }

    // Fields & Required Badges (dynamic per major type)
    const fieldBadgesContainer = $('#field-badges-container');
    fieldBadgesContainer.innerHTML = '';

    if (majorReqs.badgeType === 'french') {
      // 불어교육전공: 전공필수 (n/7) + 교과교육 (n/3) 뱃지
      const reqBadge = document.createElement('span');
      reqBadge.className = `badge-item ${status.majorRequiredMet ? 'met' : 'unmet'}`;
      reqBadge.textContent = `전공필수 ${status.majorRequiredTaken}/${majorReqs.majorRequiredCount}`;
      fieldBadgesContainer.appendChild(reqBadge);

      const edBadge = document.createElement('span');
      edBadge.className = `badge-item ${status.majorSubjectEdMet ? 'met' : 'unmet'}`;
      edBadge.textContent = `교과교육 ${status.majorSubjectEdTaken}/${majorReqs.majorSubjectEdCount}`;
      fieldBadgesContainer.appendChild(edBadge);
    } else {
      // 정보·컴퓨터교육과: 필수 + 분야별 뱃지
      const reqBadge = document.createElement('span');
      reqBadge.className = `badge-item ${status.majorRequiredMet ? 'met' : 'unmet'}`;
      reqBadge.textContent = `필수 ${status.majorRequiredTaken}/${majorReqs.majorRequiredCount}`;
      fieldBadgesContainer.appendChild(reqBadge);

      for (const f of majorReqs.majorFieldsNeeded) {
        const met = status.fieldTaken[f];
        const badge = document.createElement('span');
        badge.className = `badge-item ${met ? 'met' : 'unmet'}`;
        badge.textContent = `(${f}) ${met ? 'O' : 'X'}`;
        fieldBadgesContainer.appendChild(badge);
      }
    }

    const allMajorMet = status.majorCreditsMet && status.majorRequiredMet && status.majorScoreMet &&
      (majorReqs.badgeType === 'french' ? status.majorSubjectEdMet : status.allFieldsMet);
    $('#card-major-credits').classList.toggle('met', allMajorMet);

    // Teaching Credits
    $('#teaching-credits-val').textContent = status.teachingCredits;
    const teachPct = Math.min((status.teachingCredits / REQUIREMENTS.teachingTotalCredits) * 100, 100);
    $('#teaching-credits-bar').style.width = teachPct + '%';
    $('#card-teaching-credits').classList.toggle('met', status.teachingCreditsMet);

    // Teaching GPA & Score display
    const teachingGPATruncated = Math.floor(status.teachingGPA * 100) / 100;
    const teachingGpaDisplay = $('#teaching-gpa-display');
    if (teachingGpaDisplay) {
      teachingGpaDisplay.textContent = `평점 ${teachingGPATruncated.toFixed(2)} (${status.teachingScore}/80점)`;
      teachingGpaDisplay.style.color = status.teachingScoreMet ? 'var(--text-muted)' : 'var(--danger)';
    }

    // Teaching Areas
    const teachingBadgesContainer = $('#teaching-badges-container');
    teachingBadgesContainer.innerHTML = `
      <span class="badge-item ${status.theoryMet ? 'met' : 'unmet'}">이론 ${status.theoryCount}/6</span>
      <span class="badge-item ${status.cultureMet ? 'met' : 'unmet'}">소양 ${status.cultureCount}/4</span>
      <span class="badge-item ${status.practiceMet ? 'met' : 'unmet'}">실습 ${status.practiceCount}/2</span>
    `;
    const allTeachAreasMet = status.theoryMet && status.cultureMet && status.practiceMet && status.teachingScoreMet;
    const allTeachingMet = status.teachingCreditsMet && allTeachAreasMet;
    $('#card-teaching-credits').classList.toggle('met', allTeachingMet);

    // Gen Ed Credits
    $('#gen-ed-credits-val').textContent = status.genEdCredits;
    const genEdPct = Math.min((status.genEdCredits / REQUIREMENTS.genEdTotalCredits) * 100, 100);
    $('#gen-ed-credits-bar').style.width = genEdPct + '%';
    $('#card-gen-ed-credits').classList.toggle('met', status.genEdCreditsMet);

    // Gen Ed Area Badges
    const genEdBadgesContainer = $('#gen-ed-badges-container');
    genEdBadgesContainer.innerHTML = '';
    
    // Group 1: 첨성인기초
    const basicMet = status.genEdAreaMet['첨성인기초'] && status.genEdAreaMet['첨성인기초(수리/기초과학)'];
    // Group 2: 첨성인핵심
    const coreMet = status.genEdAreaMet['첨성인핵심(인문)'] && status.genEdAreaMet['첨성인핵심(자연)'];
    // Group 3: SDG
    const sdgMet = status.genEdAreaMet['SDG교양'];

    const genEdGroups = [
      { name: '기초', met: basicMet },
      { name: '핵심', met: coreMet },
      { name: 'SDG', met: sdgMet }
    ];

    for (const group of genEdGroups) {
      const badge = document.createElement('span');
      badge.className = `badge-item ${group.met ? 'met' : 'unmet'}`;
      badge.textContent = `${group.name} ${group.met ? 'O' : 'X'}`;
      genEdBadgesContainer.appendChild(badge);
    }
    const allGenEdMet = status.genEdCreditsMet && status.allGenEdAreasMet;
    $('#card-gen-ed-credits').classList.toggle('met', allGenEdMet);
  }

export function renderLeftSemesters() {
    const container = $('#semesters-grid');
    container.innerHTML = '';
    const status = computeStatus({ currentMajor: store.currentMajor, MAJORS: store.MAJORS, SEMESTERS, gradesMap: store.gradesMap, takenMap: store.takenMap, customCourses: store.customCourses, ALL_COURSES_MAP: store.ALL_COURSES_MAP, MAJOR_IDS: store.MAJOR_IDS, genEdCourses: store.genEdCourses, mathScienceExempt: store.mathScienceExempt, GRADE_SCALE, REQUIREMENTS, GEN_ED_AREA_REQUIREMENTS });

    for (const sem of SEMESTERS) {
      const box = document.createElement('div');
      box.className = 'semester-box';
      box.dataset.sem = sem.key;

      // Find system courses assigned to this semester
      const assignedIds = Object.keys(store.takenMap).filter(id => store.takenMap[id] === sem.key);
      const assignedCourses = assignedIds.map(id => store.ALL_COURSES_MAP.get(id)).filter(Boolean);
      // Find custom courses assigned to this semester
      const semCustomCourses = store.customCourses.filter(cc => cc.semester === sem.key);

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
        store.editingSemester = sem.key;
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
        if (courseId && store.ALL_COURSES_MAP.has(courseId)) {
          setCourseSemester(courseId, sem.key);
        }
      });

      container.appendChild(box);
    }
  }

export function createCustomCourseCard(cc) {
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
      store.customCourses = store.customCourses.filter(c => c.id !== cc.id);
      delete store.gradesMap[cc.id];
      saveState();
      renderAll();
    });

    return card;
  }

export function renderRightRecommended() {
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
      if (courseId && store.takenMap[courseId]) {
        setCourseSemester(courseId, null);
      }
    };

    if (store.currentRecTab === 'major') {
      // Group by recommended semester
      const groups = {};
      for (const c of store.MAJOR_COURSES) {
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
      const status = computeStatus({ currentMajor: store.currentMajor, MAJORS: store.MAJORS, SEMESTERS, gradesMap: store.gradesMap, takenMap: store.takenMap, customCourses: store.customCourses, ALL_COURSES_MAP: store.ALL_COURSES_MAP, MAJOR_IDS: store.MAJOR_IDS, genEdCourses: store.genEdCourses, mathScienceExempt: store.mathScienceExempt, GRADE_SCALE, REQUIREMENTS, GEN_ED_AREA_REQUIREMENTS });
      const areaInfo = [
        { name: '교직이론', count: status.theoryCount, req: 6 },
        { name: '교직소양', count: status.cultureCount, req: 4 },
        { name: '교육실습', count: status.practiceCount, req: 2 },
      ];

      for (const area of areaInfo) {
        const courses = store.TEACHING_COURSES.filter(c => c.area === area.name);
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

export function createCourseCard(course, side) {
    const card = document.createElement('div');
    const isAssigned = Boolean(store.takenMap[course.id]);
    const rightAssigned = side === 'right' && isAssigned ? ' assigned' : '';
    card.className = `course-card${side === 'left' ? ' in-semester' : rightAssigned}`;
    card.draggable = true;
    card.dataset.id = course.id;

    // Badges HTML
    let tagsHTML = '';
    if (course.field === '필수' || course.field === '전공필수') {
      tagsHTML += `<span class="tag tag-required">필수</span>`;
    } else if (course.field && course.field !== '교과교육') {
      const fieldText = store.currentMajor === 'computer' ? `(${course.field})` : course.field;
      tagsHTML += `<span class="tag tag-field">${fieldText}</span>`;
    }

    if (course.subjectEd || course.field === '교과교육') {
      tagsHTML += `<span class="tag tag-field">교과교육</span>`;
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
        actionHTML = `<span class="tag tag-practice" style="font-size: 0.68rem;">✓ ${store.takenMap[course.id]} 이수중</span>`;
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

export function renderGraduationBanner(status) {
    const banner = $('#graduation-banner');
    const bannerTitle = $('#banner-title');
    const bannerDesc = $('#banner-desc');

    if (status.allRequirementsMet) {
      banner.className = 'graduation-banner met';
      bannerTitle.textContent = '🎓 모든 졸업 요건을 충족했습니다!';
      const majorName = store.MAJORS[store.currentMajor].name;
      bannerDesc.textContent = `총 ${status.totalCredits}/140학점 · ${majorName} 전공 ${status.majorReqs.majorTotalCredits}학점 및 교직 22학점 이수가 모두 완료되었습니다.`;
    } else {
      banner.className = 'graduation-banner';
      const parts = [];
      if (!status.totalCreditsMet) parts.push(`총 학점 ${140 - status.totalCredits}학점 부족 (${status.totalCredits}/140)`);
      if (!status.majorCreditsMet) parts.push(`전공 ${status.majorReqs.majorTotalCredits - status.majorCredits}학점 부족`);
      if (!status.majorScoreMet) parts.push(`전공 성적 미달 (${status.majorScore}/75점)`);
      if (!status.majorRequiredMet) parts.push(`필수 ${status.majorReqs.majorRequiredCount - status.majorRequiredTaken}과목 부족`);
      if (status.majorReqs.badgeType === 'french') {
        if (!status.majorSubjectEdMet) parts.push(`교과교육 ${status.majorReqs.majorSubjectEdCount - status.majorSubjectEdTaken}과목 부족`);
      } else {
        if (!status.allFieldsMet) {
          const missing = status.majorReqs.majorFieldsNeeded.filter(f => !status.fieldTaken[f]);
          parts.push(`분야 (${missing.join(',')}) 미이수`);
        }
      }
      if (!status.teachingCreditsMet) parts.push(`교직 ${REQUIREMENTS.teachingTotalCredits - status.teachingCredits}학점 부족`);
      if (!status.teachingScoreMet) parts.push(`교직 성적 미달 (${status.teachingScore}/80점)`);
      if (!status.theoryMet) parts.push(`교직이론 ${REQUIREMENTS.teachingTheoryCredits - status.theoryCredits}학점 부족`);
      if (!status.cultureMet) parts.push(`교직소양 ${REQUIREMENTS.teachingCultureCredits - status.cultureCredits}학점 부족`);
      if (!status.practiceMet) parts.push(`교육실습 ${REQUIREMENTS.teachingPracticeCredits - status.practiceCredits}학점 부족`);
      if (status.bothPracticumsTaken) parts.push(`⚠ 교직실무 1·2 동시 이수 불가 (택1)`);
      if (!status.genEdCreditsMet) parts.push(`교양 ${REQUIREMENTS.genEdTotalCredits - status.genEdCredits}학점 부족`);

      bannerTitle.textContent = '졸업 요건 미충족';
      bannerDesc.textContent = parts.length > 0 ? parts.join(' · ') : '과목을 이수 학기 상자로 드래그하거나 선택하세요.';
    }
  }

export function renderFieldDetailsTable() {
    const tbody = $('#field-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const status = computeStatus({ currentMajor: store.currentMajor, MAJORS: store.MAJORS, SEMESTERS, gradesMap: store.gradesMap, takenMap: store.takenMap, customCourses: store.customCourses, ALL_COURSES_MAP: store.ALL_COURSES_MAP, MAJOR_IDS: store.MAJOR_IDS, genEdCourses: store.genEdCourses, mathScienceExempt: store.mathScienceExempt, GRADE_SCALE, REQUIREMENTS, GEN_ED_AREA_REQUIREMENTS });
    const majorReqs = status.majorReqs;

    let groups;
    if (majorReqs.badgeType === 'french') {
      groups = [
        { key: '전공필수', label: '전공필수' },
        { key: '교과교육', label: '교과교육' },
      ];
    } else {
      groups = [
        { key: '필수', label: '필수' },
        { key: '2', label: '(2)' },
        { key: '3', label: '(3)' },
        { key: '4', label: '(4)' },
        { key: '5', label: '(5)' },
        { key: '6', label: '(6)' },
      ];
    }

    groups.forEach(g => {
      const courses = store.MAJOR_COURSES.filter(c => c.field === g.key);
      if (courses.length === 0) return;

      let isGroupMet;
      if (g.key === '필수' || g.key === '전공필수') {
        isGroupMet = status.majorRequiredMet;
      } else if (g.key === '교과교육') {
        isGroupMet = status.majorSubjectEdMet;
      } else {
        isGroupMet = status.fieldTaken[g.key];
      }
      const metClass = isGroupMet ? ' met' : '';

      courses.forEach((c, idx) => {
        const tr = document.createElement('tr');
        
        let html = '';
        if (idx === 0) {
          html += `<td rowspan="${courses.length}" class="field-label${metClass}">${g.label}</td>`;
        }
        
        const isMet = !!store.takenMap[c.id];
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

    // Also render courses with no field (field === null)
    const noFieldCourses = store.MAJOR_COURSES.filter(c => c.field === null);
    if (noFieldCourses.length > 0) {
      noFieldCourses.forEach((c, idx) => {
        const tr = document.createElement('tr');
        let html = '';
        if (idx === 0) {
          html += `<td rowspan="${noFieldCourses.length}" class="field-label">기타</td>`;
        }
        const isMet = !!store.takenMap[c.id];
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
    }
  }

export function renderTeachingDetailsTable() {
    const tbody = $('#teaching-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const status = computeStatus({ currentMajor: store.currentMajor, MAJORS: store.MAJORS, SEMESTERS, gradesMap: store.gradesMap, takenMap: store.takenMap, customCourses: store.customCourses, ALL_COURSES_MAP: store.ALL_COURSES_MAP, MAJOR_IDS: store.MAJOR_IDS, genEdCourses: store.genEdCourses, mathScienceExempt: store.mathScienceExempt, GRADE_SCALE, REQUIREMENTS, GEN_ED_AREA_REQUIREMENTS });

    const groups = [
      { key: '교직이론', label: '교직이론', isMet: status.theoryMet, count: status.theoryCount, req: 6 },
      { key: '교직소양', label: '교직소양', isMet: status.cultureMet, count: status.cultureCount, req: 4 },
      { key: '교육실습', label: '교육실습', isMet: status.practiceMet, count: status.practiceCount, req: 2 },
    ];

    groups.forEach(g => {
      const courses = store.TEACHING_COURSES.filter(c => c.area === g.key);
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
        
        const isMet = !!store.takenMap[c.id];
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

export function buildGradeSelect(courseId) {
    const currentGrade = store.gradesMap[courseId] || '';
    let html = `<select class="grade-select" data-course-id="${courseId}">`;
    html += `<option value="">성적 선택</option>`;
    for (const g of GRADE_OPTIONS) {
      const sel = currentGrade === g ? ' selected' : '';
      html += `<option value="${g}"${sel}>${g}</option>`;
    }
    html += `</select>`;
    return html;
  }

export function renderSemesterEditModal(semKey) {
    const body = $('#semester-edit-body');
    body.innerHTML = '';

    // Section 1: 기존 과목 성적 -> 전공/교직
    const section1 = document.createElement('div');
    section1.className = 'semester-edit-section';
    section1.innerHTML = `<div class="semester-edit-section-title">전공/교직</div>`;
    const list1 = document.createElement('div');
    list1.className = 'semester-edit-list';

    const assignedIds = Object.keys(store.takenMap).filter(id => store.takenMap[id] === semKey);
    const assignedCourses = assignedIds.map(id => store.ALL_COURSES_MAP.get(id)).filter(Boolean);

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
    const semCustom = store.customCourses.filter(cc => cc.semester === semKey);
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
          store.gradesMap[cid] = val;
        } else {
          delete store.gradesMap[cid];
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
          store.customCourses = store.customCourses.filter(c => c.id !== customId);
          delete store.gradesMap[customId];
        } else if (courseId) {
          delete store.takenMap[courseId];
          delete store.gradesMap[courseId];
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
        store.takenMap[courseId] = semKey;
        if (grade) store.gradesMap[courseId] = grade;
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
        // Store genEdId if selected from search dropdown
        if (type === '교양' && nameInput.dataset.genEdId) {
          cc.genEdId = nameInput.dataset.genEdId;
        }
        store.customCourses.push(cc);
        if (grade) store.gradesMap[cc.id] = grade;
      }

      saveState();
      renderAll();
      renderSemesterEditModal(semKey);
    });
  }

export function updateAddCourseNameField() {
    const type = $('#add-course-type')?.value;
    const container = $('#add-course-name-container');
    const creditsInput = $('#add-course-credits');
    if (!container) return;

    if (type === '전공' || type === '교직') {
      const courses = type === '전공' ? store.MAJOR_COURSES : store.TEACHING_COURSES;
      const available = courses.filter(c => !store.takenMap[c.id]);
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
    } else if (type === '교양' && store.genEdCourses.length > 0) {
      // Gen-ed search with dropdown
      container.innerHTML = `
        <div class="gen-ed-search-container">
          <input type="text" id="add-course-name-input" placeholder="교양 과목 검색..." autocomplete="off">
          <div class="gen-ed-search-dropdown" id="gen-ed-search-dropdown" style="display:none;"></div>
        </div>
      `;
      const input = container.querySelector('#add-course-name-input');
      const dropdown = container.querySelector('#gen-ed-search-dropdown');

      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        if (query.length < 1) {
          dropdown.style.display = 'none';
          return;
        }

        const matches = store.genEdCourses.filter(c =>
          c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
        ).slice(0, 15);

        if (matches.length === 0) {
          dropdown.style.display = 'none';
          return;
        }

        dropdown.innerHTML = '';
        for (const m of matches) {
          const item = document.createElement('div');
          item.className = 'gen-ed-search-item';
          item.innerHTML = `
            <span>${m.name} <small style="color:var(--text-dim)">(${m.credits}학점)</small></span>
            <span class="search-area">${m.group} · ${m.subGroup}</span>
          `;
          item.addEventListener('click', () => {
            input.value = m.name;
            input.dataset.genEdId = m.id;
            creditsInput.value = m.credits;
            creditsInput.readOnly = true;
            dropdown.style.display = 'none';
          });
          dropdown.appendChild(item);
        }
        dropdown.style.display = 'block';
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });

      creditsInput.readOnly = false;
    } else {
      container.innerHTML = `<input type="text" id="add-course-name-input" placeholder="과목명">`;
      creditsInput.readOnly = false;
    }
  }

export function renderGenEdDetails() {
    const body = $('#gen-ed-details-body');
    if (!body) return;
    body.innerHTML = '';

    const status = computeStatus({ currentMajor: store.currentMajor, MAJORS: store.MAJORS, SEMESTERS, gradesMap: store.gradesMap, takenMap: store.takenMap, customCourses: store.customCourses, ALL_COURSES_MAP: store.ALL_COURSES_MAP, MAJOR_IDS: store.MAJOR_IDS, genEdCourses: store.genEdCourses, mathScienceExempt: store.mathScienceExempt, GRADE_SCALE, REQUIREMENTS, GEN_ED_AREA_REQUIREMENTS });
    const areaGroups = {
      '첨성인 기초': ['첨성인기초', '첨성인기초(수리/기초과학)'],
      '첨성인 핵심': ['첨성인핵심(인문)', '첨성인핵심(자연)'],
      'SDG 및 기타': ['SDG교양']
    };

    // Collect taken gen-ed course names by area
    const takenByArea = {};
    for (const cc of store.customCourses) {
      if (cc.type !== '교양') continue;
      const g = store.gradesMap[cc.id];
      if (g === 'F' || g === 'U') continue;
      const matched = store.genEdCourses.find(ge => ge.name === cc.name || ge.id === (cc.genEdId || cc.id));
      
      let area = '기타';
      if (matched) {
        const subGroup = matched.subGroup;
        if (['독서와 토론', '사고교육', '글쓰기', '외국어'].includes(subGroup)) {
          area = '첨성인기초';
        } else if (['수리', '기초과학'].includes(subGroup)) {
          area = '첨성인기초(수리/기초과학)';
        } else if (subGroup === '인문사회') {
          area = '첨성인핵심(인문)';
        } else if (subGroup === '자연과학') {
          area = '첨성인핵심(자연)';
        }
        
        // Add separately for SDG if applicable
        if (matched.isSdg) {
          if (!takenByArea['SDG교양']) takenByArea['SDG교양'] = [];
          takenByArea['SDG교양'].push({ name: cc.name, credits: cc.credits });
        }
      }
      if (!takenByArea[area]) takenByArea[area] = [];
      takenByArea[area].push({ name: cc.name, credits: cc.credits });
    }

    for (const [groupName, areas] of Object.entries(areaGroups)) {
      const groupSection = document.createElement('div');
      groupSection.className = 'gen-ed-area-section';

      const groupTitle = document.createElement('div');
      groupTitle.style.cssText = 'font-weight: 700; font-size: 0.95rem; color: var(--accent-primary); margin-bottom: 8px; padding: 4px 0;';
      groupTitle.textContent = groupName;
      groupSection.appendChild(groupTitle);

      for (const area of areas) {
        const req = GEN_ED_AREA_REQUIREMENTS[area];
        const isExempt = (area === '첨성인기초(수리/기초과학)' && store.mathScienceExempt);
        const earned = status.genEdAreaCredits[area] || 0;
        const met = status.genEdAreaMet[area];
        
        let statusHtml = `<span class="gen-ed-area-status ${met ? 'met' : 'unmet'}">${earned}/${req}학점</span>`;
        if (isExempt) {
          statusHtml = `<span class="gen-ed-area-status met">면제됨</span>`;
        }

        const areaDiv = document.createElement('div');
        
        let titleHtml = `<span class="gen-ed-area-title">${area}</span>`;
        if (area === '첨성인기초(수리/기초과학)') {
          titleHtml = `
            <span class="gen-ed-area-title" style="display:flex; align-items:center; gap:8px;">
              ${area}
              <label style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted); display:flex; align-items:center; gap:4px; cursor:pointer;">
                <input type="checkbox" class="modal-exempt-chk" ${isExempt ? 'checked' : ''}> 면제자
              </label>
            </span>
          `;
        }

        areaDiv.innerHTML = `
          <div class="gen-ed-area-header">
            ${titleHtml}
            ${statusHtml}
          </div>
        `;
        
        if (area === '첨성인기초(수리/기초과학)') {
          const chk = areaDiv.querySelector('.modal-exempt-chk');
          chk.addEventListener('change', (e) => {
            store.mathScienceExempt = e.target.checked;
            saveState();
            renderAll();
            // Re-render modal to reflect changes immediately
            document.getElementById('gen-ed-details-modal').style.display = 'none';
            document.getElementById('btn-gen-ed-details').click();
          });
        }

        // Show taken courses in this area
        const taken = takenByArea[area] || [];
        if (taken.length > 0) {
          const chips = document.createElement('div');
          chips.className = 'gen-ed-course-list';
          for (const t of taken) {
            const chip = document.createElement('span');
            chip.className = 'gen-ed-course-chip taken';
            chip.textContent = `${t.name} (${t.credits})`;
            chips.appendChild(chip);
          }
          areaDiv.appendChild(chips);
        }

        groupSection.appendChild(areaDiv);
      }
      body.appendChild(groupSection);
    }

    // Show 기타 area if any
    const etcTaken = takenByArea['기타'] || [];
    if (etcTaken.length > 0) {
      const etcSection = document.createElement('div');
      etcSection.className = 'gen-ed-area-section';
      etcSection.innerHTML = `
        <div class="gen-ed-area-header">
          <span class="gen-ed-area-title">일반교양 / 기타</span>
          <span class="gen-ed-area-status met">${etcTaken.reduce((s, t) => s + t.credits, 0)}학점</span>
        </div>
      `;
      const chips = document.createElement('div');
      chips.className = 'gen-ed-course-list';
      for (const t of etcTaken) {
        const chip = document.createElement('span');
        chip.className = 'gen-ed-course-chip taken';
        chip.textContent = `${t.name} (${t.credits})`;
        chips.appendChild(chip);
      }
      etcSection.appendChild(chips);
      body.appendChild(etcSection);
    }
  }

export function renderExcelPreview(courses) {
    const preview = $('#excel-import-preview');
    const actions = $('#excel-import-actions');
    if (!preview) return;

    const mapped = mapExcelToSemesters(courses);
    store.parsedExcelData = mapped;

    // Summary by type
    const typeCount = {};
    for (const c of mapped) {
      typeCount[c.type] = (typeCount[c.type] || 0) + 1;
    }

    let html = `<div class="excel-preview-summary">
      <strong>총 ${mapped.length}개 과목</strong> · 
      ${Object.entries(typeCount).map(([t, n]) => `${t} ${n}개`).join(' · ')}
    </div>`;

    html += `<table class="excel-preview-table">
      <thead><tr><th>학기</th><th>구분</th><th>과목명</th><th>학점</th><th>성적</th></tr></thead>
      <tbody>`;

    const shown = mapped.slice(0, 15);
    for (const c of shown) {
      html += `<tr>
        <td>${c.mappedSemester}</td>
        <td>${c.type}</td>
        <td>${c.name}</td>
        <td>${c.credits}</td>
        <td>${c.grade || '-'}</td>
      </tr>`;
    }
    if (mapped.length > 15) {
      html += `<tr><td colspan="5" style="text-align:center; color: var(--text-dim);">... 외 ${mapped.length - 15}개 과목</td></tr>`;
    }
    html += `</tbody></table>`;

    preview.innerHTML = html;
    preview.style.display = 'block';
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '8px';
  }

export function initEvents() {
    // Recommended Tab navigation
    $$('.rec-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.rec-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.currentRecTab = btn.dataset.tab;
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

    // Gen Ed Details Dialog
    const genEdDialog = $('#gen-ed-details-dialog');
    if (genEdDialog) {
      $('#btn-gen-ed-details').addEventListener('click', () => {
        renderGenEdDetails();
        genEdDialog.showModal();
      });
      $('#gen-ed-dialog-close').addEventListener('click', () => genEdDialog.close());
      genEdDialog.addEventListener('click', (e) => {
        if (e.target === genEdDialog) genEdDialog.close();
      });
    }

    // Excel Import Dialog
    const excelDialog = $('#excel-import-dialog');
    if (excelDialog) {
      $('#btn-excel-import').addEventListener('click', () => {
        // Reset state
        store.parsedExcelData = null;
        $('#excel-import-preview').style.display = 'none';
        $('#excel-import-actions').style.display = 'none';
        const dropZone = $('#excel-drop-zone');
        dropZone.style.display = '';
        excelDialog.showModal();
      });

      $('#excel-import-close').addEventListener('click', () => excelDialog.close());
      excelDialog.addEventListener('click', (e) => {
        if (e.target === excelDialog) excelDialog.close();
      });

      // Drop zone click → file input
      const dropZone = $('#excel-drop-zone');
      const fileInput = $('#excel-file-input');

      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleExcelFile(file);
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleExcelFile(file);
      });

      function handleExcelFile(file) {
        parseTranscriptExcel(file, store.MAJOR_COURSES).then(courses => {
          dropZone.style.display = 'none';
          renderExcelPreview(courses);
        }).catch(err => {
          alert('엑셀 파싱 실패: ' + err.message);
        });
      }

      // Cancel → reset preview
      $('#excel-import-cancel').addEventListener('click', () => {
        store.parsedExcelData = null;
        $('#excel-import-preview').style.display = 'none';
        $('#excel-import-actions').style.display = 'none';
        $('#excel-drop-zone').style.display = '';
        fileInput.value = '';
      });

      // Confirm → apply data
      $('#excel-import-confirm').addEventListener('click', () => {
        if (store.parsedExcelData) {
          applyExcelData(store.parsedExcelData);
          store.parsedExcelData = null;
          excelDialog.close();
        }
      });
    }
  }
