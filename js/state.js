export const store = {
  MAJORS: {},
  TEACHING_COURSES: [],
  CURRENT_TEACHING_COURSES: [],
  currentMajor: localStorage.getItem("grad-calc-current-major") || "computer",
  MAJOR_COURSES: [],
  ALL_COURSES: [],
  ALL_COURSES_MAP: new Map(),
  MAJOR_IDS: new Set(),
  genEdCourses: [],
  takenMap: {},
  gradesMap: {},
  customCourses: [],
  mathScienceExempt: false,
  currentRecTab: 'major',
  editingSemester: null,
  parsedExcelData: null
};

let listeners = [];
export function onStateChange(fn) {
  listeners.push(fn);
}
export function notify() {
  listeners.forEach(fn => fn());
}

export function getStorageKey() {
  return store.MAJORS[store.currentMajor] ? store.MAJORS[store.currentMajor].storageKey : 'grad-calc-storage';
}

export function loadState() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const data = JSON.parse(raw);
      store.takenMap = data.takenMap || {};
      store.gradesMap = data.gradesMap || {};
      store.customCourses = data.customCourses || [];
      store.mathScienceExempt = data.mathScienceExempt || false;
    } else {
      store.takenMap = {};
      store.gradesMap = {};
      store.customCourses = [];
      store.mathScienceExempt = false;
    }
  } catch {
    store.takenMap = {};
    store.gradesMap = {};
    store.customCourses = [];
    store.mathScienceExempt = false;
  }
}

export function saveState() {
  localStorage.setItem(getStorageKey(), JSON.stringify({
    takenMap: store.takenMap,
    gradesMap: store.gradesMap,
    customCourses: store.customCourses,
    mathScienceExempt: store.mathScienceExempt,
  }));
}

export function rebuildCourseMaps() {
  const majorConfig = store.MAJORS[store.currentMajor];
  store.MAJOR_COURSES = majorConfig ? majorConfig.courses : [];
  store.CURRENT_TEACHING_COURSES = (majorConfig && majorConfig.teachingCourses) ? majorConfig.teachingCourses : store.TEACHING_COURSES;
  store.ALL_COURSES = [...store.MAJOR_COURSES, ...store.CURRENT_TEACHING_COURSES];
  store.ALL_COURSES_MAP = new Map(store.ALL_COURSES.map(c => [c.id, c]));
  store.MAJOR_IDS = new Set(store.MAJOR_COURSES.map(c => c.id));
}

export function switchMajor(majorKey) {
  const oldMajor = store.currentMajor;
  if (!store.MAJORS[majorKey] || majorKey === store.currentMajor) {
    return; // Already selected
  }
  // Save current state before switching
  saveState();
  // Switch major
  store.currentMajor = majorKey;
  localStorage.setItem('grad-calc-current-major', majorKey);
  // Rebuild course maps
  rebuildCourseMaps();
  // Load new major's state
  loadState();
  notify();
}

export function setCourseSemester(courseId, semKey) {
  if (semKey) {
    store.takenMap[courseId] = semKey;
  } else {
    delete store.takenMap[courseId];
  }
  saveState();
  notify();
}

export function resetAll() {
  store.takenMap = {};
  store.gradesMap = {};
  store.customCourses = [];
  store.mathScienceExempt = false;
  saveState();
  notify();
}

export function applyExcelData(mappedCourses) {
    for (const c of mappedCourses) {
      // Check if course already exists in system courses
      const systemCourse = store.ALL_COURSES_MAP.get(c.code);

      if (systemCourse) {
        // System course (전공/교직): assign to semester and set grade
        store.takenMap[c.code] = c.mappedSemester;
        if (c.grade) store.gradesMap[c.code] = c.grade;
      } else {
        // Custom course: add to store.customCourses
        const existingIdx = store.customCourses.findIndex(cc => cc.name === c.name && cc.semester === c.mappedSemester);
        if (existingIdx === -1) {
          const cc = {
            id: `import-${c.code || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            semester: c.mappedSemester,
            type: c.type,
            name: c.name,
            credits: c.credits,
          };
          // If this is a gen-ed course, store the genEdId for area tracking
          if (c.type === '교양') {
            const matched = store.genEdCourses.find(ge => ge.id === c.code || ge.name === c.name);
            if (matched) cc.genEdId = matched.id;
          }
          store.customCourses.push(cc);
          if (c.grade) store.gradesMap[cc.id] = c.grade;
        }
      }
    }
    saveState();
    notify();
    
  }
