const mongosh=requied('mongoosh');
mongosh.Schema("fleetMaintenanceRequests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "vehicleId",
        "requestType",
        "issueCategory",
        "priority",
        "requestedBy",
        "requestStatus",
        "createdAt",
        "updatedAt"
      ],
      properties: {
        vehicleId: {
          // vehicleId:mongosh.SchemaType.ObjectID,
          bsonType: mongosh.SchemaType.ObjectID,
          description: "Reference to vehicle _id"
        },
        requestType: {
          bsonType: "string",
          enum: [
            "Preventive",
            "Breakdown",
            "Inspection",
            "Accident"
          ],
          description: "Type of maintenance request"
        },
        issueCategory: {
          bsonType: "string",
          enum: [
            "Engine",
            "Brakes",
            "Tyres",
            "Electrical",
            "AC",
            "Body",
            "General"
          ]
        },
        issueDescription: {
          bsonType: "string",
          description: "Reported issue details"
        },
        priority: {
          bsonType: "string",
          enum: ["low", "medium", "high", "critical"]
        },
        requestedBy: {
          bsonType: "object",
          required: ["userId", "role"],
          properties: {
            userId: { bsonType: "objectId" },
            role: {
              bsonType: "string",
              enum: ["driver", "vendor", "admin"]
            },
            contactNumber: { bsonType: "string" }
          }
        },
        requestStatus: {
          bsonType: "string",
          enum: [
            "raised",
            "approved",
            "rejected",
            "assigned",
            "in-progress",
            "closed"
          ]
        },
        approval: {
          bsonType: "object",
          properties: {
            approvedBy: { bsonType: "objectId" },
            approvedAt: { bsonType: "date" },
            remarks: { bsonType: "string" }
          }
        },
        assignedServiceVendor: {
          bsonType: "object",
          properties: {
            vendorName: { bsonType: "string" },
            contactNumber: { bsonType: "string" },
            serviceCenter: { bsonType: "string" }
          }
        },
        attachments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["fileName", "fileUrl"],
            properties: {
              fileName: { bsonType: "string" },
              fileUrl: { bsonType: "string" },
              uploadedAt: { bsonType: "date" }
            }
          }
        },
        maintenanceId: {
          bsonType: "objectId",
          description: "Linked fleetMaintenance record"
        },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
documentSchema.index({ ownerType: mongoose.SchemaType.ObjectId, ownerId: mongoose.SchemaType.ObjectId, documentType: mongoose.SchemaType.ObjectId}, { unique: true });
module.exports = mongoose.model("fleetMaintenanceRequests", documentSchema);
