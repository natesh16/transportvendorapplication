// controllers/employeeBulkUpload.controller.js
const ExcelJS = require("exceljs");
const Employee = require("../models/corporate.employeeModel");

exports.bulkUploadEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required"
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const sheet = workbook.getWorksheet("Employees");
    if (!sheet) {
      return res.status(400).json({
        success: false,
        message: "Sheet 'Employees' not found"
      });
    }

    const employees = [];
    const errors = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const employee = {
        employeeCode: row.getCell(1).value,
        name: row.getCell(2).value,
        email: row.getCell(3).value,
        role: row.getCell(4).value,
        isActive: row.getCell(5).value === true
      };

      // Validation
      if (!employee.employeeCode || !employee.name || !employee.email) {
        errors.push({
          row: rowNumber,
          error: "Required fields missing"
        });
      } else {
        employees.push(employee);
      }
    });

    if (employees.length > 0) {
      await Employee.insertMany(employees, { ordered: false });
    }

    res.status(200).json({
      success: true,
      insertedCount: employees.length,
      errorCount: errors.length,
      errors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: error.message
    });
  }
};
