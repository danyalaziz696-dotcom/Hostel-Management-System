const express = require("express");
const router = express.Router();
const allocationService = require("../services/AllocationService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  if (status === 500) console.error("allocation route error:", err.stack || err.message);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/allocations", async (req, res) => {
  try {
    const allocations = await allocationService.getAllAllocations({
      includeDeallocated: req.query.includeDeallocated === "true",
    });
    res.json(allocations);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/allocations", async (req, res) => {
  try {
    const allocation = await allocationService.createAllocation(req.body);
    res.json(allocation);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/allocations/stats", async (req, res) => {
  try {
    res.json(await allocationService.getStats());
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/allocations/:id", async (req, res) => {
  try {
    const allocation = await allocationService.deallocateAllocation(req.params.id, req.body && req.body.reason);
    res.json({
      message: "Room deallocated successfully",
      _id: allocation._id,
      allocation,
    });
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/allocations/:id", async (req, res) => {
  try {
    const allocation = await allocationService.getAllocationById(req.params.id);
    res.json(allocation);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
