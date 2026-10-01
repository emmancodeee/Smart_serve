const path = require('path');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');
const engData = require('@tesseract.js-data/eng');

let ocrWorkerPromise = null;
let pdfParseLib = null;

function getPdfParse() {
  if (!pdfParseLib) {
    pdfParseLib = require('pdf-parse');
  }

  return pdfParseLib;
}

function normalizeSchoolOrfText(rawText) {
  return String(rawText || '')
    .replace(/\r/g, '\n')
    .replace(/[|]/g, ' ')
    .replace(/[‘’`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, '-')
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function findSchoolOrfValue(text, lines, patterns, fallbackPatterns = []) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].replace(/\s+/g, ' ').trim();
  }

  for (const line of lines) {
    const compact = line.replace(/\s+/g, ' ').trim();
    for (const pattern of fallbackPatterns) {
      const match = compact.match(pattern);
      if (match?.[1]) return match[1].replace(/\s+/g, ' ').trim();
    }
  }

  return '';
}

function parseSchoolOrfSubjects(lines) {
  const subjects = [];

  for (const line of lines) {
    const compact = line.replace(/\s+/g, ' ').replace(/^\d+\s+/, '').trim();
    if (!compact) continue;
    if (/student name|student number|course|school year|year level|semester|subject|description|tuition fee|grand total|important|date printed|date of approval/i.test(compact)) continue;

    const rowMatch = compact.match(/^(?:\d+\s+)?([A-Z]{2,4}\s*\d{3}[A-Z]?)\s+([A-Z]{2,5}-[A-Z]{2,6}\d-\w{1,3})\s+(.+)$/i);
    if (!rowMatch) continue;

    const code = rowMatch[1].replace(/\s+/g, ' ').trim();
    const section = rowMatch[2].replace(/\s+/g, ' ').trim();
    let title = rowMatch[3].trim();

    title = title
      .replace(/\b[A-Z]{2,5}-[A-Z]{2,6}\d-\w{1,3}\b/g, ' ')
      .replace(/\b(BSIT3-S1|BSIT3-SI|BSIT3-51|BSIT3-5I|YS32|Y532|Y53Z|AU-BSIT3-S1)\b/gi, ' ')
      .replace(/\b\d+\s+\d+\s+\d+\s+\d+\b/g, ' ')
      .replace(/\b\d+\s+\d+\s+\d+\b/g, ' ')
      .replace(/\b\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)\b/gi, ' ')
      .replace(/\b\d{1,2}:\d{2}\s*(AM|PM)\b/gi, ' ')
      .replace(/\b(Mon|Tue|Tues|Wed|Thu|Thur|Fri|Sat|Sun)(\/(Mon|Tue|Tues|Wed|Thu|Thur|Fri|Sat|Sun))*\b/gi, ' ')
      .replace(/\b(R\/Sat|Fri\/Sat|Wed\/Thu|R\/F)\b/gi, ' ')
      .replace(/\b(Phase\s*\d+|Room\s*\d+|\d{2,4})\b/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (title.length < 5) continue;
    if (!subjects.some(item => item.code === code && item.title === title)) {
      subjects.push({ code, section, title, display: `${code} - ${title}` });
    }
  }

  return subjects.slice(0, 20);
}

function parseSchoolOrfMaterials(lines) {
  const books = [];
  const uniformItems = [];

  for (const line of lines) {
    const compact = line.replace(/\s+/g, ' ').trim();
    if (!compact) continue;

    if (/college learning materials/i.test(compact) && !books.includes('College Learning Materials')) books.push('College Learning Materials');
    if (/answer sheets/i.test(compact) && !books.includes('Answer Sheets')) books.push('Answer Sheets');
    if (/au phinma shirt/i.test(compact) && !uniformItems.includes('AU PHINMA Shirt')) uniformItems.push('AU PHINMA Shirt');
    if (/corporate attire/i.test(compact) && !uniformItems.includes('Corporate Attire')) uniformItems.push('Corporate Attire');
  }

  return { books, uniformItems };
}

function parseSchoolOrfText(rawText) {
  const normalizedText = normalizeSchoolOrfText(rawText);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);

  const schoolYearSemesterLine = lines.find(line => /school year semester/i.test(line));
  const courseYearLevelLine = lines.find(line => /course/i.test(line) && /year level/i.test(line));
  const combinedIdentityLine = lines.find(line => /student number/i.test(line) && /student name/i.test(line));

  let studentName = findSchoolOrfValue(normalizedText, lines, [/student\s*name\s*[:;=-]?\s*([A-Z][A-Z,\s.'-]{5,})/i], [/student\s*name\s*[:;=-]?\s*(.+)$/i]);
  let studentNumber = findSchoolOrfValue(normalizedText, lines, [/student\s*number\s*[:;=-]?\s*([0-9]{2}-[0-9]{4}-[0-9]{4,5})/i, /student\s*number\s*[:;=-]?\s*([a-z0-9-]{8,})/i], [/student\s*number\s*[:;=-]?\s*(.+)$/i]);
  const course = findSchoolOrfValue(normalizedText, lines, [/course\s*[:;=-]?\s*((?:Bachelor|BS)[^\n]+?)(?:student\s*number|year\s*level|semester|school\s*year|$)/i], [/course\s*[:;=-]?\s*(.+)$/i]);
  const yearLevel = findSchoolOrfValue(normalizedText, lines, [/year\s*level[ \t]*[:;=-]?[ \t]*([^\n:]{2,30})/i], [/year\s*level\s*[:;=-]?\s*(.+)$/i]);
  const semester = findSchoolOrfValue(normalizedText, lines, [/semester\s*[:;=-]?\s*([^\n:]{1,20})/i], [/semester\s*[:;=-]?\s*(.+)$/i]);
  const schoolYear = findSchoolOrfValue(normalizedText, lines, [/school\s*year\s*[:;=-]?\s*([0-9]{2,4}[-/][0-9]{2,4}[^\n]*)/i, /school\s*year\s*[:;=-]?\s*([^\n:]{3,30})/i], [/school\s*year\s*[:;=-]?\s*(.+)$/i]);
  const combinedSemester = findSchoolOrfValue(normalizedText, lines, [/school\s*year\s*semester\s*[:;=-]?\s*([A-Z0-9\-/ ]+)/i], []);
  const subjects = parseSchoolOrfSubjects(lines);
  const materials = parseSchoolOrfMaterials(lines);
  const uniqueSections = [...new Set(subjects.map(item => String(item.section || '').trim()).filter(Boolean))];
  const inferredStudentType = uniqueSections.length <= 1 && subjects.length >= 5 ? 'regular' : 'irregular';

  if (combinedIdentityLine) {
    const normalizedIdentity = combinedIdentityLine.replace(/\s+/g, ' ').trim();
    const detectedNumber = normalizedIdentity.match(/([0-9]{2}-[0-9]{4}-[0-9]{4,6})/i)?.[1] || '';
    const nameBetweenLabels = normalizedIdentity.match(/student number\s+(.+?)\s+student name/i)?.[1] || '';
    const detectedName = nameBetweenLabels.replace(/[:;=-]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (detectedNumber) studentNumber = detectedNumber;
    if (detectedName && !/\d/.test(detectedName)) studentName = detectedName;
  }

  let nextCourse = course;
  let nextYearLevel = yearLevel;
  if (courseYearLevelLine) {
    const normalizedCourseLine = courseYearLevelLine.replace(/\s+/g, ' ').trim();
    const detectedCourse = normalizedCourseLine.match(/course\s+(.+?)\s+year level/i)?.[1] || '';
    if (detectedCourse) nextCourse = detectedCourse.replace(/[:;=-]/g, ' ').replace(/\s{2,}/g, ' ').trim();

    const courseLineIndex = lines.indexOf(courseYearLevelLine);
    const yearLevelCandidates = [lines[courseLineIndex + 1] || '', lines[courseLineIndex + 2] || '', lines[courseLineIndex + 3] || ''];
    const possibleYearLevel = yearLevelCandidates.find(line => /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\s+Year$/i.test(String(line || '').trim()) || /^\d+(st|nd|rd|th)\s+Year$/i.test(String(line || '').trim())) || '';
    if (possibleYearLevel) nextYearLevel = possibleYearLevel.trim();
  }

  if (!/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\s+Year$/i.test(String(nextYearLevel || '').trim()) && !/^\d+(st|nd|rd|th)\s+Year$/i.test(String(nextYearLevel || '').trim())) {
    const standaloneYearLevel = lines.find(line => /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\s+Year$/i.test(String(line || '').trim()) || /^\d+(st|nd|rd|th)\s+Year$/i.test(String(line || '').trim()));
    if (standaloneYearLevel) nextYearLevel = standaloneYearLevel.trim();
  }

  if (!studentName || !studentNumber) {
    const swappedLine = lines.find(line => /student number/i.test(line) && /student name/i.test(line));
    if (swappedLine) {
      const detectedNumber = swappedLine.match(/([0-9]{2}-[0-9]{4}-[0-9]{4,6})/i)?.[1] || '';
      const detectedName = swappedLine.replace(/student number|student name|:/gi, ' ').replace(/([0-9]{2}-[0-9]{4}-[0-9]{4,6})/i, ' ').replace(/\s{2,}/g, ' ').trim();
      if (!studentNumber && detectedNumber) studentNumber = detectedNumber;
      if (!studentName && detectedName) studentName = detectedName;
    }
  }

  const extractedName = String(studentName || '').trim();
  const extractedNumber = String(studentNumber || '').trim();
  const looksLikeStudentNumber = value => /^[0-9]{2}-[0-9]{4}-[0-9]{4,6}$/i.test(String(value || '').trim());
  const looksLikeName = value => /^[A-Z][A-Z,\s.'-]{5,}$/i.test(String(value || '').trim()) && !/\d/.test(String(value || '').trim()) && !/student\s*name|student\s*number/i.test(String(value || '').trim());

  if (looksLikeStudentNumber(extractedName) && !looksLikeStudentNumber(extractedNumber)) {
    studentNumber = extractedName;
    studentName = '';
  } else if (!looksLikeName(extractedName) && looksLikeName(extractedNumber)) {
    studentName = extractedNumber;
    studentNumber = extractedName;
  } else if (!looksLikeName(extractedName) && looksLikeStudentNumber(extractedNumber)) {
    studentName = '';
    studentNumber = extractedNumber;
  }

  let nextSemester = semester;
  let nextSchoolYear = schoolYear;
  if (schoolYearSemesterLine) {
    const normalizedSchoolYearLine = schoolYearSemesterLine.replace(/\s+/g, ' ').trim();
    const leftSide = normalizedSchoolYearLine.split(/school year semester/i)[0] || '';
    const rightSide = normalizedSchoolYearLine.split(/school year semester/i)[1] || '';
    const leftClean = leftSide.replace(/[:;=-]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    const rightClean = rightSide.replace(/[:;=-]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (!nextSchoolYear && leftClean) nextSchoolYear = leftClean;
    if (!nextSemester && rightClean) nextSemester = rightClean;
  }
  if (combinedSemester) {
    const combined = combinedSemester.replace(/\s+/g, ' ').trim();
    const syMatch = combined.match(/(SY\s*[0-9]{2,4}-[0-9]{2,4})/i);
    const semMatch = combined.match(/(SEM\s*[IVX0-9]+|Y\dS\d)/i);
    if (!nextSchoolYear && syMatch?.[1]) nextSchoolYear = syMatch[1].trim();
    if (!nextSemester && semMatch?.[1]) nextSemester = semMatch[1].trim();
  }

  return {
    text: normalizedText,
    studentName: String(studentName || '').trim(),
    studentNumber: String(studentNumber || '').trim(),
    course: String(nextCourse || '').trim(),
    yearLevel: String(nextYearLevel || '').trim(),
    semester: String(nextSemester || '').trim(),
    schoolYear: String(nextSchoolYear || '').trim(),
    studentType: inferredStudentType,
    books: materials.books,
    uniformItems: materials.uniformItems,
    subjects
  };
}

function scoreSchoolOrfParse(parsed) {
  let score = 0;
  if (parsed?.studentName) score += 3;
  if (parsed?.studentNumber) score += 3;
  if (parsed?.course) score += 2;
  if (parsed?.yearLevel) score += 1;
  if (parsed?.semester) score += 1;
  if (parsed?.schoolYear) score += 1;
  score += Math.min(Array.isArray(parsed?.subjects) ? parsed.subjects.length : 0, 8);
  return score;
}

async function recognizeSchoolOrf(worker, imageBuffer) {
  const passes = [
    { label: 'auto', params: { tessedit_pageseg_mode: '3', preserve_interword_spaces: '1' } },
    { label: 'single_block', params: { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' } },
    { label: 'sparse', params: { tessedit_pageseg_mode: '11', preserve_interword_spaces: '1' } }
  ];

  let best = null;
  for (const pass of passes) {
    await worker.setParameters(pass.params);
    const result = await worker.recognize(imageBuffer);
    const parsed = parseSchoolOrfText(result?.data?.text || '');
    const score = scoreSchoolOrfParse(parsed);
    const candidate = {
      pass: pass.label,
      confidence: Number(result?.data?.confidence || 0),
      rawText: String(result?.data?.text || ''),
      parsed,
      score
    };

    if (!best || candidate.score > best.score || (candidate.score === best.score && candidate.confidence > best.confidence)) {
      best = candidate;
    }
  }

  return best;
}

async function createSchoolOrfImageRegions(imageBuffer) {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = Number(metadata.width || 0);
  const height = Number(metadata.height || 0);
  if (!width || !height) return [];

  const crop = (leftRatio, topRatio, widthRatio, heightRatio) => ({
    left: Math.max(0, Math.floor(width * leftRatio)),
    top: Math.max(0, Math.floor(height * topRatio)),
    width: Math.max(1, Math.floor(width * widthRatio)),
    height: Math.max(1, Math.floor(height * heightRatio))
  });

  const regions = [
    { label: 'full', area: crop(0, 0, 1, 1) },
    { label: 'header_left', area: crop(0.02, 0.02, 0.50, 0.14) },
    { label: 'header_right', area: crop(0.58, 0.02, 0.26, 0.14) },
    { label: 'subject_table', area: crop(0.02, 0.11, 0.92, 0.36) }
  ];

  const output = [];
  for (const region of regions) {
    const buffer = await image.clone().extract(region.area).grayscale().normalize().sharpen().png().toBuffer();
    output.push({ label: region.label, buffer });
  }

  return output;
}

function mergeSchoolOrfParses(regions) {
  const merged = {
    text: regions.map(item => `[${item.label}]${item.rawText}`).join('\n\n'),
    studentName: '',
    studentNumber: '',
    course: '',
    yearLevel: '',
    semester: '',
    schoolYear: '',
    subjects: []
  };

  for (const region of regions) {
    const parsed = region.parsed || {};
    if (!merged.studentName && parsed.studentName) merged.studentName = parsed.studentName;
    if (!merged.studentNumber && parsed.studentNumber) merged.studentNumber = parsed.studentNumber;
    if (!merged.course && parsed.course) merged.course = parsed.course;
    if (!merged.yearLevel && parsed.yearLevel) merged.yearLevel = parsed.yearLevel;
    if (!merged.semester && parsed.semester) merged.semester = parsed.semester;
    if (!merged.schoolYear && parsed.schoolYear) merged.schoolYear = parsed.schoolYear;

    for (const subject of Array.isArray(parsed.subjects) ? parsed.subjects : []) {
      if (!merged.subjects.some(item => item.code === subject.code && item.title === subject.title)) {
        merged.subjects.push(subject);
      }
    }
  }

  return merged;
}

async function recognizeCroppedSchoolOrf(worker, imageBuffer) {
  const regions = await createSchoolOrfImageRegions(imageBuffer);
  const recognizedRegions = [];

  for (const region of regions) {
    const params = region.label === 'subject_table'
      ? { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' }
      : { tessedit_pageseg_mode: '11', preserve_interword_spaces: '1' };

    await worker.setParameters(params);
    const result = await worker.recognize(region.buffer);
    recognizedRegions.push({
      label: region.label,
      confidence: Number(result?.data?.confidence || 0),
      rawText: String(result?.data?.text || ''),
      parsed: parseSchoolOrfText(result?.data?.text || '')
    });
  }

  const parsed = mergeSchoolOrfParses(recognizedRegions);
  const confidence = recognizedRegions.length ? Math.round(recognizedRegions.reduce((sum, item) => sum + item.confidence, 0) / recognizedRegions.length) : 0;

  return {
    pass: 'auto_crop',
    confidence,
    rawText: parsed.text,
    parsed,
    score: scoreSchoolOrfParse(parsed)
  };
}

async function extractSchoolOrfFromPdf(pdfBuffer) {
  const pdfParse = getPdfParse();
  const result = await pdfParse(pdfBuffer);
  const rawText = String(result?.text || '').trim();
  const parsed = parseSchoolOrfText(rawText);
  return {
    pass: 'pdf_text',
    confidence: rawText ? 100 : 0,
    rawText,
    parsed,
    score: scoreSchoolOrfParse(parsed)
  };
}

async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker('eng', 1, {
      langPath: engData.langPath,
      gzip: engData.gzip,
      workerPath: path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js'),
      corePath: path.join(process.cwd(), 'node_modules', 'tesseract.js-core')
    }).catch(error => {
      ocrWorkerPromise = null;
      throw error;
    });
  }

  return ocrWorkerPromise;
}

async function extractOrf(buffer, originalname = '', mimetype = '') {
  const fileName = String(originalname || '').toLowerCase();
  const mimeType = String(mimetype || '').toLowerCase();
  const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');

  let best;
  if (isPdf) {
    best = await extractSchoolOrfFromPdf(buffer);
  } else {
    const worker = await getOcrWorker();
    const candidates = [await recognizeSchoolOrf(worker, buffer), await recognizeCroppedSchoolOrf(worker, buffer)];
    best = candidates.filter(Boolean).sort((a, b) => (b.score - a.score) || (b.confidence - a.confidence))[0];
  }

  if (isPdf && !String(best?.rawText || '').trim()) {
    return {
      error: {
        status: 400,
        body: {
          error: 'This PDF does not contain selectable text. Only text-based ORF PDFs are supported right now.'
        }
      }
    };
  }

  return {
    message: 'ORF extracted successfully',
    confidence: Number(best?.confidence || 0),
    pass: best?.pass || '',
    score: Number(best?.score || 0),
    rawText: String(best?.rawText || ''),
    parsed: best?.parsed || parseSchoolOrfText('')
  };
}

module.exports = {
  extractOrf
};
