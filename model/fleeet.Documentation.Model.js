const mongoose = require("mongoose");
mongoose.Schema("fleetDocuments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "fleetdeatils",
        "ownerType",
        "ownerId",
        "documentType",
        "documentNumber",
        "fileDetails",
        "issueDate",
        "expiryDate",
        "verification",
        "isMandatory",
        "complianceStatus",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      properties: {
        fleetdetails:{
          type:mongoose.SchemaType.ObjectId
        },
        ownerType: {
          bsonType:mongoose.SchemaType.ObjectId,
          enum: ["vehicle","Driver"],
          description: "Only fleet/vehicle documents allowed"
        },

        ownerId: {
          type:mongoose.SchemaTypes.ObjectId,
          description: "Vehicle _id reference"
        },

        documentType: [
            {
                documentType: "RC",
                require:[ture,"Document should be attached"]
            },
            {
                documentType: "Insurance",
                require:[ture,"Document should be attached"]
            },
            {
                documentType: "Permit",
                // require:[ture,"Document should be attached"]
            },
            {
                documentType: "RoadTax",
                // require:[ture,"Document should be attached"]
            }
        ],
          description: "Mandatory fleet document type"
        },
        documentNumber: {
          bsonType: mongoose.SchemaType.ObjectId
        },

        fileDetails: {
          bsonType: "object",
          required: ["fileName", "fileUrl", "fileSizeKB", "uploadedAt"],
          properties: {
            fileName: { bsonType: "string" },
            fileUrl: { bsonType: "string" },
            fileSizeKB: { bsonType: "number" },
            uploadedAt: { bsonType: "date" }
          }
        },
        issueDate: { bsonType: "date" },
        expiryDate: { bsonType: "date" },
        isExpired: {
          bsonType: "bool",
          description: "Auto-calculated via cron/job"
        },
        verification: {
          bsonType: "object",
          required: ["status"],
          properties: {
            status: {
              enum: ["pending", "approved", "rejected"]
            },
            verifiedBy: { bsonType: "string" },
            verifiedAt: { bsonType: "date" },
            remarks: { bsonType: "string" }
          }
        },
        isMandatory: {
          bsonType: "bool",
          description: "All fleet docs are mandatory"
        },
        complianceStatus: {
          bsonType: "string",
          enum: ["compliant", "non-compliant"]
        },
        isActive: { bsonType: "bool" },
        deletedAt: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
)
documentSchema.index({ ownerType: mongoose.SchemaType.ObjectId, ownerId: mongoose.SchemaType.ObjectId, documentType: mongoose.SchemaType.ObjectId}, { unique: true });
module.exports = mongoose.model("fleetDocuments", documentSchema);
