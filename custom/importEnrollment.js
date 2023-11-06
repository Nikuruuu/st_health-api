const enrollmentValidationSchema = require("../schema/enrollmentValidationSchema");
const ClassEnrollment = require("../models/ClassEnrollment");
const StudentProfile = require("./models/StudentProfileSchema");
const ClassProfile = require("../models/ClassProfileSchema");
const AcademicYear = require("../models/AcademicYearSchema");
const { parseExcelToJson } = require("../utils/importDataToExcel");
const { capitalizeFirstLetter } = require("../utils/stringHelpers");

const importClassEnrollments = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer);

  const enrollments = [];
  const errors = [];

  for (let rowData of data) {
    rowData.grade = rowData.grade ? capitalizeFirstLetter(rowData.grade) : "";
    rowData.section = rowData.section
      ? capitalizeFirstLetter(rowData.section)
      : "";
    try {
      const { value, error } = enrollmentValidationSchema.validate(rowData, {
        abortEarly: false,
      });
      if (error) throw error;

      const student = await StudentProfile.findOne({ lrn: value.lrn });
      if (!student) throw new Error("Invalid LRN");

      const classDetails = await ClassProfile.findOne({
        grade: value.grade,
        section: value.section,
      });
      if (!classDetails) throw new Error("Invalid grade or section");

      const academicDetails = await AcademicYear.findOne({
        schoolYear: value.schoolYear,
      });
      if (!academicDetails) throw new Error("Invalid school year");

      const newEnrollment = new ClassEnrollment({
        student: student._id,
        classProfile: classDetails._id,
        academicYear: academicDetails._id,
        ...value,
      });

      await newEnrollment.save();
      enrollments.push(newEnrollment);
    } catch (e) {
      errors.push({
        lrn: rowData.lrn || "Unknown LRN",
        errors: e.details
          ? e.details.map((detail) => detail.message)
          : [e.message],
      });
    }
  }

  return { enrollments, errors };
};

module.exports = importClassEnrollments;
