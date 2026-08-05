import { updateMajorUI, renderAll, initEvents, $ } from './js/ui.js';
import { store, loadState, switchMajor, rebuildCourseMaps, onStateChange } from './js/state.js';

/* =====================================================
   졸업요건 계산기 — app.js (엔트리포인트)
   모듈 초기화 및 데이터 로딩을 담당합니다.
   ===================================================== */

(function () {
  'use strict';

  async function init() {
    // 1. 전공/교직 과목 데이터 로딩
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

    // 2. 레거시 스토리지 키 마이그레이션
    const oldData = localStorage.getItem('grad-calc-v4');
    if (oldData && !localStorage.getItem('grad-calc-v4-computer')) {
      localStorage.setItem('grad-calc-v4-computer', oldData);
      localStorage.removeItem('grad-calc-v4');
    }

    // 3. 유효한 전공 확인
    if (!store.MAJORS[store.currentMajor]) {
      store.currentMajor = Object.keys(store.MAJORS)[0];
      localStorage.setItem('grad-calc-current-major', store.currentMajor);
    }

    // 4. 과목 맵 구축 및 저장된 상태 복원
    rebuildCourseMaps();
    loadState();

    // 5. 교양 과목 데이터 로딩
    try {
      const resp = await fetch('data/gen_ed_courses.json');
      if (resp.ok) {
        store.genEdCourses = await resp.json();
      }
    } catch (e) {
      console.warn('교양 과목 데이터를 불러올 수 없습니다:', e);
    }

    // 6. 전공 선택 드롭다운 렌더링
    const majorSelect = $('#major-select');
    if (majorSelect) {
      majorSelect.innerHTML = '';
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

    // 7. 이벤트 바인딩 및 상태 구독
    initEvents();
    onStateChange(() => {
      updateMajorUI();
      renderAll();
    });

    // 8. 초기 화면 렌더링
    updateMajorUI();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
