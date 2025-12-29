import KYC from "../models/KYC.model.js";
import User from "../models/User.model.js";
import { encryptData } from "../middleware/encryption.middleware.js";

export const submitKYC = async (req, res) => {
  try {
    const userId = req.user._id;
    const files = req.files;

    // Check if KYC already exists
    let kyc = await KYC.findOne({ userId });

    const kycData = {
      userId,
      dateOfBirth: req.body.dateOfBirth,
      nationality: req.body.nationality,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      postalCode: req.body.postalCode,
      idType: req.body.idType,
      idNumber: encryptData(req.body.idNumber), // Encrypt ID number
      occupation: req.body.occupation,
      sourceOfFunds: req.body.sourceOfFunds,
      pepStatus: req.body.pepStatus === "true",
      idDocumentFront: files?.idDocumentFront?.[0]?.path,
      idDocumentBack: files?.idDocumentBack?.[0]?.path,
      proofOfAddress: files?.proofOfAddress?.[0]?.path,
      selfie: files?.selfie?.[0]?.path,
      status: "pending",
    };

    if (kyc) {
      kyc = await KYC.findByIdAndUpdate(kyc._id, kycData, { new: true });
    } else {
      kyc = await KYC.create(kycData);
    }

    // Update user KYC status
    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    res.json({
      success: true,
      kyc: {
        id: kyc._id,
        status: kyc.status,
        level: kyc.level,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getKYC = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id });

    if (!kyc) {
      return res.json({ success: true, kyc: null });
    }

    res.json({
      success: true,
      kyc: {
        id: kyc._id,
        status: kyc.status,
        level: kyc.level,
        dateOfBirth: kyc.dateOfBirth,
        nationality: kyc.nationality,
        address: kyc.address,
        city: kyc.city,
        country: kyc.country,
        postalCode: kyc.postalCode,
        idType: kyc.idType,
        idVerificationStatus: kyc.idVerificationStatus,
        idVerificationScore: kyc.idVerificationScore,
        amlChecks: kyc.amlChecks,
        verifiedAt: kyc.verifiedAt,
        rejectionReason: kyc.rejectionReason,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateKYC = async (req, res) => {
  try {
    const kyc = await KYC.findOneAndUpdate({ userId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    res.json({
      success: true,
      kyc: {
        id: kyc._id,
        status: kyc.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyIDDocument = async (req, res) => {
  try {
    const files = req.files;

    // In production, integrate with ID verification service (Jumio, Onfido, etc.)
    // For now, simulate verification
    const verificationResult = {
      verified: true,
      score: 85,
      details: {
        documentMatch: true,
        faceMatch: files?.selfie ? true : false,
        livenessCheck: true,
        dataExtraction: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      },
    };

    // Update KYC with verification result
    await KYC.findOneAndUpdate(
      { userId: req.user._id },
      {
        idVerificationStatus: verificationResult.verified
          ? "verified"
          : "failed",
        idVerificationScore: verificationResult.score,
        idVerificationDetails: verificationResult.details,
      }
    );

    res.json({
      success: true,
      ...verificationResult,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const runAMLChecks = async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || req.user._id;

    // In production, integrate with AML service (ComplyAdvantage, etc.)
    // For now, simulate AML checks
    const amlResult = {
      sanctionsList: false,
      pepList: false,
      adverseMedia: false,
      // 'as const' is TypeScript syntax and invalid in plain JS/runtime
      riskRating: "low",
      lastChecked: new Date(),
    };

    // Update KYC with AML results
    await KYC.findOneAndUpdate(
      { userId: targetUserId },
      { amlChecks: amlResult }
    );

    res.json({
      success: true,
      ...amlResult,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getComplianceReport = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ kycStatus: "approved" });
    const pendingReviews = await User.countDocuments({ kycStatus: "pending" });
    const rejectedUsers = await User.countDocuments({ kycStatus: "rejected" });

    res.json({
      success: true,
      report: {
        totalUsers,
        verifiedUsers,
        pendingReviews,
        rejectedUsers,
        complianceRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
