export function parseTranscriptExcel(file, MAJOR_COURSES) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Find header row (contains '연도', '학기', etc.)
          let headerIdx = -1;
          for (let i = 0; i < Math.min(rows.length, 5); i++) {
            const row = rows[i];
            if (row && row.some(cell => String(cell).includes('연도'))) {
              headerIdx = i;
              break;
            }
          }
          if (headerIdx === -1) {
            reject(new Error('엑셀 헤더를 찾을 수 없습니다.'));
            return;
          }

          const headers = rows[headerIdx].map(h => String(h).trim());
          const colMap = {};
          headers.forEach((h, i) => { colMap[h] = i; });

          const courses = [];
          const yearCol = colMap['연도'] ?? 0;
          const semCol = colMap['학기'] ?? 1;
          const typeCol = colMap['교과목구분'] ?? 2;
          const codeCol = colMap['교과목코드'] ?? 3;
          const nameCol = colMap['교과목명'] ?? 4;
          const creditCol = colMap['학점'] ?? 5;
          const gradeCol = colMap['성적등급'] ?? 6;
          const scoreCol = colMap['점수'] ?? 7;

          for (let i = headerIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[yearCol]) continue;

            const year = parseInt(row[yearCol]);
            const semRaw = String(row[semCol] || '').trim();
            const typeRaw = String(row[typeCol] || '').trim();
            const code = String(row[codeCol] || '').trim();
            const name = String(row[nameCol] || '').trim();
            const credits = parseInt(row[creditCol]) || 0;
            const grade = String(row[gradeCol] || '').trim();
            const score = parseFloat(row[scoreCol]) || 0;

            if (!name || credits === 0) continue;

            // 학기 매핑
            let semKey = '기타';
            if (semRaw === '1학기') semKey = '1학기';
            else if (semRaw === '2학기') semKey = '2학기';
            // 그 외(0학기, 계절학기(하계), 계절학기(동계) 등)는 '기타'로 처리

            // 과목구분 매핑: 전공/교직/교양 외 모든 것은 일반선택
            let type = '일반선택';
            if (typeRaw === '전공') {
              const isInMajor = MAJOR_COURSES.some(c => c.id === code || c.name === name);
              type = isInMajor ? '전공' : '일반선택';
            }
            else if (typeRaw === '교직') type = '교직';
            else if (typeRaw === '교양') type = '교양';

            courses.push({ year, semRaw, semKey, type, code, name, credits, grade, score });
          }

          resolve(courses);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsArrayBuffer(file);
    });
  }


export function mapExcelToSemesters(courses) {
    // Determine the user's entry year (earliest year in data)
    const years = [...new Set(courses.map(c => c.year))].sort();
    const entryYear = years[0] || 2024;

    const result = [];
    for (const c of courses) {
      const yearDiff = c.year - entryYear;
      let semesterKey;

      if (c.semKey === '1학기') {
        const grade = yearDiff + 1;
        semesterKey = `${Math.min(grade, 4)}-1`;
      } else if (c.semKey === '2학기') {
        const grade = yearDiff + 1;
        semesterKey = `${Math.min(grade, 4)}-2`;
      } else {
        // 기타 학기: 해당 연도의 학년으로 배치 (1학기에 넣음)
        const grade = yearDiff + 1;
        semesterKey = `${Math.min(grade, 4)}-1`;
      }

      result.push({ ...c, mappedSemester: semesterKey });
    }
    return result;
  }

