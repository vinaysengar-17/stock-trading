import Lot from "../models/Lot.js";
import Trade from "../models/Trade.js";
import { realizeLotsFIFO, realizeLotsLIFO } from "./lotStrategies.js";

/**
 * Creates a new trade and handles associated lot creation/realization
 * @param {Object} tradeData - Trade data including stock_name, quantity, price, etc.
 * @param {string} [method="FIFO"] - Inventory method ("FIFO" or "LIFO")
 * @returns {Promise<Object>} Object containing the created trade and realization results (if sell)
 * @throws {Error} If trade creation or lot processing fails
 */
export const createTrade = async (tradeData, method = "FIFO") => {
  try {
    // Create and save the new trade document
    const trade = new Trade(tradeData);
    await trade.save();

    let realizationResult = null;

    // Handle sell trades (negative quantity)
    if (trade.quantity < 0) {
      // Select the appropriate realization strategy based on method
      const realizeLots = method === "FIFO" ? realizeLotsFIFO : realizeLotsLIFO;
      // Execute the lot realization process
      realizationResult = await realizeLots(trade);
    }
    // Handle buy trades (positive quantity)
    else {
      await Lot.create({
        trade_id: trade._id,
        stock_name: trade.stock_name,
        lot_quantity: trade.quantity,
        price: trade.price,
      });
    }

    return {
      trade,
      realizationResult,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves all trades sorted by timestamp (newest first)
 * @returns {Promise<Array>} Array of all trade documents
 */
export const getAllTrades = async () => {
  return await Trade.find({}).sort({ timestamp: -1 });
};

/**
 * Retrieves a single trade by its ID
 * @param {string} id - MongoDB ID of the trade
 * @returns {Promise<Object|null>} The trade document or null if not found
 */
export const getTradeById = async (id) => {
  return Trade.findById(id);
};

/**
 * Creates multiple trades in bulk with consistent method
 * @param {Array} tradesData - Array of trade data objects
 * @param {string} [method="FIFO"] - Inventory method to use for all trades
 * @returns {Promise<Array>} Array of results for each trade creation attempt
 */
export const bulkCreateTrades = async (tradesData, method = "FIFO") => {
  const results = [];

  // Process each trade sequentially
  for (const tradeData of tradesData) {
    try {
      const trade = await createTrade(tradeData, method);
      results.push({ success: true, trade });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
};
