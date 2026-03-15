const express = require("express");
const { MongoClient } = require("mongodb");
const router = express.Router();

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let db;

// 初始化資料庫連接
MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017")
  .then((client) => {
    db = client.db("sports-doping-db");
    console.log("Cases route connected to MongoDB");
  })
  .catch((err) => console.error("Cases route DB error:", err));

// Get all cases with filtering and pagination
router.get("/", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const {
      sport,
      nationality,
      year,
      substanceCategory,
      punishmentType,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};
    const andConditions = [];

    // Build filter query
    if (sport) query.sport = sport;
    if (nationality) query.nationality = nationality;
    if (year) query.year = parseInt(year);
    if (substanceCategory) query.substanceCategory = substanceCategory;

    // 處罰類型篩選
    if (punishmentType) {
      switch (punishmentType) {
        case "禁賽":
          query["punishment.banDuration"] = {
            $exists: true,
            $ne: "",
            $not: { $regex: /無處罰|無禁賽|無（成功|無正式禁賽/i },
          };
          break;
        case "獎牌剝奪":
          query["punishment.medalStripped"] = true;
          break;
        case "成績取消":
          query["punishment.resultsCancelled"] = true;
          break;
        case "罰款":
          andConditions.push({
            $or: [
              { "punishment.otherPenalties": { $regex: /罰款|罰金/i } },
              { "punishment.banDuration": { $regex: /罰款|罰金/i } },
            ],
          });
          break;
        case "警告":
          andConditions.push({
            $or: [
              { "punishment.banDuration": { $regex: /警告|告誡|公開警告/i } },
              { "punishment.otherPenalties": { $regex: /警告|告誡/i } },
            ],
          });
          break;
        case "其他":
          andConditions.push({
            $or: [
              { "punishment.otherPenalties": { $exists: true, $ne: "" } },
              { "punishment.banDuration": { $regex: /其他|特殊/i } },
            ],
          });
          break;
      }
    }

    // Text search
    if (search) {
      const escaped = escapeRegex(search);
      andConditions.push({
        $or: [
          { athleteName: { $regex: escaped, $options: "i" } },
          { sport: { $regex: escaped, $options: "i" } },
          { nationality: { $regex: escaped, $options: "i" } },
          { substance: { $regex: escaped, $options: "i" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute queries in parallel
    const [cases, total] = await Promise.all([
      db
        .collection("cases")
        .find(query)
        .sort({ year: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      db.collection("cases").countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      cases,
      totalCases: total,
      currentPage: parseInt(page),
      totalPages,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Cases query error:", error);
    res
      .status(500)
      .json({
        error:
          process.env.NODE_ENV === "production"
            ? "伺服器錯誤，請稍後再試"
            : error.message,
      });
  }
});

// Get unique values for filters
router.get("/filters", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const [sports, nationalities, categories, years] = await Promise.all([
      db.collection("cases").distinct("sport"),
      db.collection("cases").distinct("nationality"),
      db.collection("cases").distinct("substanceCategory"),
      db.collection("cases").distinct("year"),
    ]);

    res.json({
      sports: sports.sort(),
      nationalities: nationalities.sort(),
      substanceCategories: categories.sort(),
      years: years.sort((a, b) => b - a), // 年份降序排列
    });
  } catch (error) {
    console.error("Filters query error:", error);
    res
      .status(500)
      .json({
        error:
          process.env.NODE_ENV === "production"
            ? "伺服器錯誤，請稍後再試"
            : error.message,
      });
  }
});

// Get case by ID
router.get("/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const { ObjectId } = require("mongodb");
    const caseData = await db
      .collection("cases")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json(caseData);
  } catch (error) {
    console.error("Case by ID query error:", error);
    res
      .status(500)
      .json({
        error:
          process.env.NODE_ENV === "production"
            ? "伺服器錯誤，請稍後再試"
            : error.message,
      });
  }
});

module.exports = router;
