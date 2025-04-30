import Lot from "../models/Lot.js";
export const getAllLots = async (req, res, next) => {
  try {
    console.log("Query parameters:", req.query); // Log incoming query

    const { stock_name, method = "FIFO" } = req.query;
    const query = {};

    if (stock_name) {
      query.stock_name = stock_name;
    }

    // console.log("Final query:", query); // Log the final query

    // Fetch lots from database with sorting:
    // - FIFO: Oldest first (createdAt ascending)
    // - LIFO: Newest first (createdAt descending)
    const lots = await Lot.find(query).sort({
      createdAt: method === "FIFO" ? 1 : -1,
    });

    // console.log("Found lots:", lots); // Log the results

    res.json({
      status: "success",
      data: lots,
      message: "Lots retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for retrieving a single lot by ID
 * @param {Object} req - Express request object with ID parameter
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

export const getLotById = async (req, res, next) => {
  try {
    // Find the lot by MongoDB ObjectId
    const lot = await Lot.findById(req.params.id);

    // If lot not found, send 404 response
    if (!lot) {
      return res.status(404).json({
        status: "error",
        message: "Lot not found",
      });
    }

    res.json({
      status: "success",
      data: lot,
      message: "Lot retrieved successfully",
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};
