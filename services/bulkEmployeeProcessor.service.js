const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");

const Employee = require("../models/corporate.employeeModel");
const Corporate = require("../models/corporate.Model");
const BulkUploadJob = require("../models/bulkUploadJob.model");

const {
  generateEmployeeCode,
  generateEmployeeLoginId,
  generateTempPassword
} = require("../utils/credentialUtil");

const BATCH_SIZE = 50;

exports.processBulkEmployees = async ({ fileBuffer, jobId, user }) => {
  const failedRows = [];
  let inserted = 0;
  let duplicates = 0;

  try {
    await BulkUploadJob.findByIdAndUpdate(jobId, {
      status: "PROCESSING"
    });

    const corporate = await Corporate.findById(user.corporateId)
      .select("corporateCode")
      .lean();

    const workbook = XLSX.read(fileBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const existing = await Employee.find(
      { corporateId: user.corporateId },
      "loginId"
    ).lean();

    const existingLoginIds = new Set(existing.map(e => e.loginId));

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      const docs = await Promise.all(
        batch.map(async (r, idx) => {
          const rowNumber = i + idx + 2;

          try {
            if (!r["name.firstName"] || !r.dateOfBirth) {
              throw new Error("Missing required fields");
            }

            const loginId = generateEmployeeLoginId(
              corporate.corporateCode,
              r["name.firstName"],
              r.dateOfBirth
            );

            if (existingLoginIds.has(loginId)) {
              duplicates++;
              failedRows.push({
                row: rowNumber,
                error: "Duplicate employee"
              });
              return null;
            }

            existingLoginIds.add(loginId);

            const tempPassword = generateTempPassword(
              r["name.firstName"],
              r.dateOfBirth
            );

            return {
              corporateId: user.corporateId,
              employeeCode: generateEmployeeCode(
                corporate.corporateCode,
                r["name.firstName"]
              ),
              loginId,
              password: await bcrypt.hash(tempPassword, 10),
              mustChangePassword: true,
              name: {
                firstName: r["name.firstName"],
                lastName: r["name.lastName"]
              },
              dateOfBirth: new Date(r.dateOfBirth),
              joiningDate: new Date(r.joiningDate),
              createdBy: user._id
            };
          } catch (err) {
            failedRows.push({ row: rowNumber, error: err.message });
            return null;
          }
        })
      );

      const validDocs = docs.filter(Boolean);
      if (validDocs.length) {
        const result = await Employee.insertMany(validDocs, {
          ordered: false
        });
        inserted += result.length;
      }
    }

    await BulkUploadJob.findByIdAndUpdate(jobId, {
      status: "COMPLETED",
      summary: {
        total: rows.length,
        inserted,
        failed: failedRows.length,
        duplicates
      },
      failedRows
    });
  } catch (err) {
    await BulkUploadJob.findByIdAndUpdate(jobId, {
      status: "FAILED"
    });
  }
};
