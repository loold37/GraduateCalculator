import { updateMajorUI, renderAll, initEvents, $ } from './js/ui.js';
import { store, loadState, saveState, switchMajor, setCourseSemester, resetAll, rebuildCourseMaps, onStateChange } from './js/state.js';

/* =====================================================
   졸업요건 계산기 — app.js
   2-Column Drag & Drop / 이수학기 매핑 / 계산 엔진
   ===================================================== */

(function () {
  'use strict';

  // ───────── Course Data ─────────

  // 정보·컴퓨터교육과 전공 과목

  // ───────── Gen Ed Data ─────────

  // Requirement thresholds (공통 교직/교양 요건)


  // ───────── Grade Scale ─────────



  // ───────── State ─────────

  // store.takenMap: { [courseId]: semesterKey (e.g. '1-1') }
  // store.gradesMap: { [courseId]: gradeString (e.g. 'A+', 'B0', 'S') }
  // store.customCourses: array of { id, semester, type, name, credits }




  



  // ───────── Computation Engine ─────────

  // ───────── DOM Helpers ─────────


  // ───────── Render Functions ─────────

  

  // Dashboard Summary
  

  // Left Column: Real Semesters Grid (1-1 ~ 4-2)
  

  // Create a card for a custom course in a semester box
  // Create a card for a custom course in a semester box
  

  // Right Column: Recommended / Uncompleted Courses Panel
  

  // Create Course Card Component
  

  // Graduation Banner
  

  // Field Details Modal Rendering
  

  // Teaching Details Modal Rendering
  

  // ───────── Semester Edit Modal ─────────

  

  

  

  // ───────── Gen Ed Details Modal ─────────

  

  // ───────── Excel Import ─────────


  

  

  // Init Events & Controls
  

  async function init() {
    // 1. Load major data from JSON
    try {
      const resp = await fetch('data/majors.json');
      if (!resp.ok) throw new Error('Failed to fetch majors.json');
      const data = await resp.json();
      store.MAJORS = data.majors;
      store.TEACHING_COURSES = data.teachingCourses;
    } catch (e) {
      console.error('전공 데이터를 불러올 수 없습니다:', e);
      alert('데이터 로딩 오류: 서버 환경에서 실행해주세요.');
      return;
    }

    // Migrate old storage key to new per-major key
    const oldData = localStorage.getItem('grad-calc-v4');
    if (oldData && !localStorage.getItem('grad-calc-v4-computer')) {
      localStorage.setItem('grad-calc-v4-computer', oldData);
      localStorage.removeItem('grad-calc-v4');
    }

    // Ensure valid current major
    if (!store.MAJORS[store.currentMajor]) {
      store.currentMajor = Object.keys(store.MAJORS)[0];
      localStorage.setItem('grad-calc-current-major', store.currentMajor);
    }

    // Ensure course maps match the current major
    rebuildCourseMaps();
    loadState();

    // Load gen ed courses data
    try {
      const resp = await fetch('data/gen_ed_courses.json');
      if (resp.ok) {
        store.genEdCourses = await resp.json();
      }
    } catch (e) {
      console.warn('교양 과목 데이터를 불러올 수 없습니다:', e);
    }

    // Major selector dynamic rendering and event
    const majorSelect = $('#major-select');
    if (majorSelect) {
      majorSelect.innerHTML = ''; // Clear options
      for (const key in store.MAJORS) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = store.MAJORS[key].name;
        majorSelect.appendChild(option);
      }
      majorSelect.value = store.currentMajor;
      majorSelect.addEventListener('change', (e) => {
        switchMajor(e.target.value);
      });
    }

    initEvents();
    onStateChange(() => {
      updateMajorUI();
      renderAll();
    });
    updateMajorUI();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
