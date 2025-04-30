import * as tradeService from "../services/tradeService.js";

/**
 * Handles creation of a new trade (buy or sell)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createTrade = async (req, res, next) => {
  try {
    // Get method from query params or default to FIFO
    const method = req.query.method || "FIFO";

    // Validate method is either FIFO or LIFO
    if (!["FIFO", "LIFO"].includes(method)) {
      return res.status(400).json({
        status: "error",
        message: "Method must be either FIFO or LIFO",
      });
    }

    // Create trade using tradeService
    const { trade, realizationResult } = await tradeService.createTrade(
      req.body,
      method
    );

    const response = {
      status: "success",
      data: { trade },
      message: "Trade created successfully",
    };

    // Add realization details if this was a sell trade
    if (realizationResult) {
      response.data.realization = realizationResult;
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles fetching all trades
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllTrades = async (req, res, next) => {
  try {
    // Get all trades from tradeService (sorted by timestamp)
    const trades = await tradeService.getAllTrades();

    res.json({
      status: "success",
      data: trades,
      message: "Trades retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles fetching a single trade by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

export const getTradeById = async (req, res, next) => {
  try {
    // Get trade by ID from tradeService
    const trade = await tradeService.getTradeById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        status: "error",
        message: "Trade not found",
      });
    }

    res.json({
      status: "success",
      data: trade,
      message: "Trade retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles bulk creation of trades
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const bulkCreateTrades = async (req, res, next) => {
  try {
    const { trades, method = "FIFO" } = req.body;

    // Validate trades is an array
    if (!Array.isArray(trades)) {
      return res.status(400).json({
        status: "error",
        message: "Trades must be an array",
      });
    }

    // Process bulk trades using tradeService
    const results = await tradeService.bulkCreateTrades(trades, method);

    res.json({
      status: "success",
      data: results,
      message: "Bulk trade operation completed",
    });
  } catch (error) {
    next(error);
  }
};
