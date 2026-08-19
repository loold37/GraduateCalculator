export const GEN_ED_AREA_REQUIREMENTS = {
    '첨성인기초': 3,
    '첨성인기초(수리/기초과학)': 3,
    '첨성인핵심(인문)': 3,
    '첨성인핵심(자연)': 3,
    'SDG교양': 3,
  };
export const REQUIREMENTS = {
    teachingTotalCredits: 22,
    teachingTheoryCredits: 12,  // 6과목 * 2학점
    teachingCultureCredits: 6,  // 4과목 (2+1+2+1)
    teachingPracticeCredits: 4, // 2과목 (2+2)
    genEdTotalCredits: 30,
  };
export const GRADE_SCALE = {
    'A+': 4.3, 'A0': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B0': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C0': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D0': 1.0, 'D-': 0.7,
    'F': 0.0,
    'S': null, // Pass - credits count, no GPA impact
    'U': null, // Fail - no credits, no GPA impact
  };

export function convertGPAToScore(gpa) {
  if (gpa <= 0) return 0;
  if (gpa >= 4.3) return 100;
  return Math.round(gpa * 10) + 56;
}

export function computeStatus(state) {
  const {
    currentMajor, MAJORS, SEMESTERS, gradesMap, takenMap, customCourses, ALL_COURSES_MAP, MAJOR_IDS, genEdCourses, mathScienceExempt
  } = state;
    const majorReqs = MAJORS[currentMajor].requirements;

    let majorCredits = 0;
    let majorRequiredTaken = 0;
    let majorSubjectEdTaken = 0; // 불어교육전공: 교과교육 이수 과목 수
    const fieldTaken = { '2': false, '3': false, '4': false, '5': false, '6': false };
    
    let majorGpaWeightedSum = 0;
    let majorGpaCreditsSum = 0;

    let teachingCredits = 0;
    let theoryCredits = 0;
    let cultureCredits = 0;
    let practiceCredits = 0;

    let theoryCount = 0;
    let cultureCount = 0;
    let practiceCount = 0;

    let teachingGpaWeightedSum = 0;
    let teachingGpaCreditsSum = 0;

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

      let earnedCredits = 0;
      let gSum = 0;
      let gCreds = 0;

      if (grade === 'F') {
        gSum = 0.0 * credits;
        gCreds = credits;
        earnedCredits = 0;
      } else if (grade === 'U') {
        earnedCredits = 0;
      } else if (grade === 'S') {
        earnedCredits = credits;
      } else if (grade && GRADE_SCALE[grade] !== undefined && GRADE_SCALE[grade] !== null) {
        const gpaVal = GRADE_SCALE[grade];
        gSum = gpaVal * credits;
        gCreds = credits;
        earnedCredits = credits;
      } else {
        earnedCredits = credits;
      }

      gpaWeightedSum += gSum;
      gpaCreditsSum += gCreds;
      if (stats) {
        stats.credits += earnedCredits;
        stats.gpaSum += gSum;
        stats.gpaCredits += gCreds;
      }

      return { earnedCredits, gSum, gCreds };
    }

    // Process system courses (from takenMap)
    for (const [id, semKey] of Object.entries(takenMap)) {
      if (!semKey) continue;
      const course = ALL_COURSES_MAP.get(id);
      if (!course) continue;

      const { earnedCredits, gSum, gCreds } = processCourseGrade(id, course.credits, semKey);
      totalCredits += earnedCredits;

      if (MAJOR_IDS.has(id)) {
        majorCredits += earnedCredits;
        majorGpaWeightedSum += gSum;
        majorGpaCreditsSum += gCreds;
        
        if (earnedCredits > 0) {
          // 컴퓨터교육과: field === '필수'
          if (course.field === '필수') majorRequiredTaken++;
          // 불어교육전공: field === '전공필수'
          if (course.field === '전공필수') majorRequiredTaken++;
          // 불어교육전공: 교과교육 이수 인정 (field가 교과교육이거나 subjectEd 플래그가 있는 경우)
          if (course.field === '교과교육' || course.subjectEd) majorSubjectEdTaken++;
          // 컴퓨터교육과 분야별 추적
          if (course.field && fieldTaken.hasOwnProperty(course.field)) {
            fieldTaken[course.field] = true;
          }
        }
      } else {
        teachingCredits += earnedCredits;
        teachingGpaWeightedSum += gSum;
        teachingGpaCreditsSum += gCreds;
        
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
      const { earnedCredits, gSum, gCreds } = processCourseGrade(cc.id, cc.credits, cc.semester);
      totalCredits += earnedCredits;

      if (cc.type === '전공') {
        majorCredits += earnedCredits;
        majorGpaWeightedSum += gSum;
        majorGpaCreditsSum += gCreds;
      } else if (cc.type === '교직') {
        teachingCredits += earnedCredits;
        teachingGpaWeightedSum += gSum;
        teachingGpaCreditsSum += gCreds;
      }
    }

    // ── 교양 영역별 이수 계산 ──
    let genEdCredits = 0;
    const genEdAreaCredits = {}; // { subGroup: credits }
    for (const key of Object.keys(GEN_ED_AREA_REQUIREMENTS)) {
      genEdAreaCredits[key] = 0;
    }
    genEdAreaCredits['기타'] = 0;

    // Map gen-ed course IDs for quick lookup
    const genEdMap = new Map(genEdCourses.map(c => [c.id, c]));

    // Check custom courses with type '교양'
    for (const cc of customCourses) {
      if (cc.type !== '교양') continue;
      const earnedCredits = (gradesMap[cc.id] === 'F' || gradesMap[cc.id] === 'U') ? 0 : cc.credits;
      if (earnedCredits <= 0) continue;
      genEdCredits += earnedCredits;

      // Try to find this course in genEdCourses by name or id
      let matchedGenEd = genEdMap.get(cc.genEdId || cc.id);
      if (!matchedGenEd) {
        // Try matching by name
        matchedGenEd = genEdCourses.find(g => g.name === cc.name);
      }
      if (matchedGenEd) {
        if (matchedGenEd.isSdg) {
          genEdAreaCredits['SDG교양'] += earnedCredits;
        }

        const subGroup = matchedGenEd.subGroup;
        if (['독서와 토론', '사고교육', '글쓰기', '외국어'].includes(subGroup)) {
          genEdAreaCredits['첨성인기초'] += earnedCredits;
        } else if (['수리', '기초과학'].includes(subGroup)) {
          genEdAreaCredits['첨성인기초(수리/기초과학)'] += earnedCredits;
        } else if (subGroup === '인문사회') {
          genEdAreaCredits['첨성인핵심(인문)'] += earnedCredits;
        } else if (subGroup === '자연과학') {
          genEdAreaCredits['첨성인핵심(자연)'] += earnedCredits;
        } else {
          genEdAreaCredits['기타'] += earnedCredits;
        }
      } else {
        genEdAreaCredits['기타'] += earnedCredits;
      }
    }

    const teachingTotalCount = theoryCount + cultureCount + practiceCount;

    // 교직실무 1/2 택1 제약: 둘 다 이수 시 경고 및 하나만 카운트
    const hasPracticum1 = !!takenMap['TCHR0521'];
    const hasPracticum2 = !!takenMap['TCHR0523'];
    const bothPracticumsTaken = hasPracticum1 && hasPracticum2;
    let adjustedCultureCount = cultureCount;
    let adjustedCultureCredits = cultureCredits;
    if (bothPracticumsTaken) {
      // 둘 다 이수했으면 하나는 무효: count -1, credits에서 교직실무2(2학점) 제외
      adjustedCultureCount = cultureCount - 1;
      adjustedCultureCredits = cultureCredits - 2; // 교직실무 2의 2학점 제외
    }

    const fieldsMetCount = Object.values(fieldTaken).filter(Boolean).length;
    const majorCreditsMet = majorCredits >= majorReqs.majorTotalCredits;
    const majorRequiredMet = majorRequiredTaken >= majorReqs.majorRequiredCount;
    const majorSubjectEdMet = majorReqs.majorSubjectEdCount
      ? majorSubjectEdTaken >= majorReqs.majorSubjectEdCount
      : true;
    const allFieldsMet = majorReqs.majorFieldsNeeded
      ? fieldsMetCount >= majorReqs.majorFieldsNeeded.length
      : true;

    const teachingCreditsMet = teachingCredits >= REQUIREMENTS.teachingTotalCredits;
    const theoryMet = theoryCredits >= REQUIREMENTS.teachingTheoryCredits;
    const cultureMet = adjustedCultureCredits >= REQUIREMENTS.teachingCultureCredits;
    const practiceMet = practiceCredits >= REQUIREMENTS.teachingPracticeCredits;

    const totalGPA = gpaCreditsSum > 0 ? gpaWeightedSum / gpaCreditsSum : 0;
    const totalCreditsMet = totalCredits >= 140;

    const majorGPA = majorGpaCreditsSum > 0 ? majorGpaWeightedSum / majorGpaCreditsSum : 0;
    const teachingGPA = teachingGpaCreditsSum > 0 ? teachingGpaWeightedSum / teachingGpaCreditsSum : 0;

    const majorScore = convertGPAToScore(majorGPA);
    const teachingScore = convertGPAToScore(teachingGPA);

    const majorScoreMet = majorScore >= 75;
    const teachingScoreMet = teachingScore >= 80;

    // 교양 요건 체크
    const genEdCreditsMet = genEdCredits >= REQUIREMENTS.genEdTotalCredits;
    const genEdAreaMet = {};
    for (const [area, req] of Object.entries(GEN_ED_AREA_REQUIREMENTS)) {
      if (area === '첨성인기초(수리/기초과학)' && mathScienceExempt) {
        genEdAreaMet[area] = true;
      } else {
        genEdAreaMet[area] = (genEdAreaCredits[area] || 0) >= req;
      }
    }
    const allGenEdAreasMet = Object.values(genEdAreaMet).every(Boolean);

    const allMajorFieldsMet = majorReqs.badgeType === 'french'
      ? majorSubjectEdMet
      : allFieldsMet;

    const allRequirementsMet =
      majorCreditsMet && majorRequiredMet && allMajorFieldsMet && majorScoreMet &&
      teachingCreditsMet && theoryMet && cultureMet && practiceMet && teachingScoreMet &&
      totalCreditsMet && genEdCreditsMet;

    const electiveCredits = totalCredits - (majorCredits + teachingCredits + genEdCredits);

    return {
      majorCredits, majorRequiredTaken, majorSubjectEdTaken, fieldTaken, fieldsMetCount,
      teachingCredits, theoryCredits,
      cultureCredits: adjustedCultureCredits, practiceCredits,
      theoryCount, cultureCount: adjustedCultureCount, practiceCount, teachingTotalCount,
      majorCreditsMet, majorRequiredMet, majorSubjectEdMet, allFieldsMet,
      teachingCreditsMet, theoryMet, cultureMet, practiceMet,
      totalCredits, totalGPA, totalCreditsMet, semesterStats,
      majorGPA, teachingGPA, majorScore, teachingScore, majorScoreMet, teachingScoreMet,
      allRequirementsMet, bothPracticumsTaken,
      genEdCredits, genEdCreditsMet, genEdAreaCredits, genEdAreaMet, allGenEdAreasMet,
      electiveCredits,
      majorReqs, // pass requirements to renderers
    };
  }

