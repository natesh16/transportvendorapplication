const mongoose = require("mongoose");
const { generateVendorCode } = require("../utils/vendorCode.util");

/**
 * 📄 Vendor Compliance Document Schema
 * Secure • Auditable • Expiry-Aware • Enterprise Ready
 */

const vendorDocumentSchema = new mongoose.Schema(
    {
        /* ---------------- Document Classification ---------------- */

        type: {
            type: String,
            enum: [
                "COMPANY_REGISTRATION",
                "GST_CERTIFICATE",
                "PAN",
                "TRADE_LICENSE",
                "LABOUR_LICENSE",
                "INSURANCE",
                "BANK_DETAILS",
                "AGREEMENT"
            ],
            required: true,
            index: true
        },

        /* ---------------- Identity & Authority ---------------- */

        documentNumber: {
            type: String,
            trim: true,
            uppercase: true
        },

        issuedBy: {
            type: String,
            trim: true
        },

        issueDate: Date,

        expiryDate: {
            type: Date,
            index: true
        },

        /* ---------------- File Storage ---------------- */

        fileUrl: {
            type: String,
            required: true
        },

        fileMeta: {
            mimeType: String,
            sizeKB: Number,
            checksum: String // SHA256 / MD5 (optional)
        },

        /* ---------------- Verification Workflow ---------------- */

        verificationStatus: {
            type: String,
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            default: "PENDING",
            index: true
        },

        verifiedAt: Date,

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CorporateUser"
        },

        /* ---------------- Audit Metadata ---------------- */

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VendorAdmin",
            required: true
        },

        uploadedAt: {
            type: Date,
            default: Date.now
        },

        /* ---------------- Compliance Safety ---------------- */

        isExpired: {
            type: Boolean,
            default: false,
            index: true
        },

        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        }
    },
    {
        _id: false,
        timestamps: true
    }
);

/* ========================================================= */
/* 🔒 Pre-save Compliance Logic                               */
/* ========================================================= */

vendorDocumentSchema.index(
  { corporateId: 1, vendorCode: 1 },
  { unique: true, sparse: true }
);


vendorDocumentSchema.pre("validate", function (next) {
    const mandatoryDocs = [
        "COMPANY_REGISTRATION",
        "GST_CERTIFICATE",
        "PAN",
        "AGREEMENT"
    ];

    const available = this.documents.map((d) => d.type);

    const missing = mandatoryDocs.filter(
        (d) => !available.includes(d)
    );

    if (missing.length > 0) {
        return next(
            new Error(
                `Missing mandatory vendor documents: ${missing.join(", ")}`
            )
        );
    }

    next();
});

vendorDocumentSchema.index(
    { corporateId: 1, vendorCode: 1 },
    { unique: true }
);

vendorDocumentSchema.index({ isActive: 1 });
vendorDocumentSchema.index({ isBlacklisted: 1 });

vendorDocumentSchema.virtual("isCompliant").get(function () {
    return this.documents.every((d) => d.verified === true);
});

vendorDocumentSchema.pre("save", function (next) {
    if (this.expiryDate && this.expiryDate < new Date()) {
        this.isExpired = true;
        this.verified = false;
    }
    next();
});


vendorDocumentSchema.pre("save", async function (next) {
  /* Only when verification status changes to VERIFIED */
  if (
    this.isModified("verificationStatus") &&
    this.verificationStatus === "VERIFIED"
  ) {
    /* Prevent regeneration */
    if (this.vendorCode) return next();

    this.vendorCode = await generateVendorCode(this.corporateId);
    this.verifiedAt = new Date();
    this.isActive = true;
  }

  next();
});

/* ========================================================= */
/* 📊 Virtuals                                               */
/* ========================================================= */

vendorDocumentSchema.virtual("isValid").get(function () {
    if (this.expiryDate && this.expiryDate < new Date()) return false;
    return this.verified === true;
});

module.exports = vendorDocumentSchema;
