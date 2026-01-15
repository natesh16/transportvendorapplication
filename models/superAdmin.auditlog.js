const mongoose = require("mongoose");
const auditSchema = new mongoose.Schema(
    {
        /* 🔎 What happened */
        action: {
            type: String,
            required: true,
            index: true // e.g. CREATE_VENDOR, APPROVE_VENDOR
        },

        actionCategory: {
            type: String,
            enum: [
                "AUTH",
                "CONFIG",
                "CRUD",
                "APPROVAL",
                "OVERRIDE",
                "SECURITY",
                "BILLING",
                "SYSTEM"
            ],
            index: true
        },

        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "LOW",
            index: true
        },

        /* 🧱 On which entity */
        entityType: {
            type: String,
            required: true,
            index: true // User, Vendor, Corporate, Trip, Invoice
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },

        /* 👤 Who performed it */
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        performedByRole: {
            type: String,
            enum: [
                "SUPER_ADMIN",
                "CORPORATE_ADMIN",
                "CORPORATE_SUPERVISOR",
                "VENDOR_ADMIN",
                "VENDOR_SUPERVISOR"
            ],
            index: true
        },

        /* 🏢 Tenant context (critical for Super Admin) */
        tenantContext: {
            corporateId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Corporate",
                index: true
            },
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Vendor",
                index: true
            }
        },

        /* 🔄 Change tracking */
        changes: {
            before: { type: mongoose.Schema.Types.Mixed },
            after: { type: mongoose.Schema.Types.Mixed }
        },

        /* 🌍 Request metadata */
        requestMeta: {
            ipAddress: String,
            userAgent: String,
            requestId: String,
            apiEndpoint: String,
            httpMethod: String
        },

        /* 🚨 Super admin override tracking */
        isOverride: {
            type: Boolean,
            default: false,
            index: true
        },

        overrideReason: String,

        /* 🧾 Human-readable note */
        remarks: String,

        /* ⏱️ Timestamp */
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        collection: "audit_logs",
        versionKey: false
    }
);

module.exports = mongoose.model("AuditLog", auditSchema);
