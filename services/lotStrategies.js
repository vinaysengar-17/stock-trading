import Lot from "../models/Lot.js";

/**
 * Fetches all open lots (OPEN or PARTIALLY_REALIZED) for a given stock
 * @param {string} stockName - Name of the stock to filter lots
 * @param {object} sortCriteria - MongoDB sort criteria
 * @returns {Promise<Array>} Array of Lot documents
 */
const getOpenLots = async (stockName, sortCriteria) => {
  return Lot.find({
    stock_name: stockName,
    lot_status: { $in: ["OPEN", "PARTIALLY_REALIZED"] },
  }).sort(sortCriteria);
};

/**
 * Realizes lots against a sell trade based on given sort criteria
 * @param {object} sellTrade - The sell trade document
 * @param {object} sortCriteria - Sorting criteria for lot selection
 * @returns {Promise<object>} Object containing realization results
 * @throws {Error} If no open lots found or insufficient quantity available
 */

const realizeLots = async (sellTrade, sortCriteria) => {
  const sellQuantity = Math.abs(sellTrade.quantity);
  let remainingSellQuantity = sellQuantity;
  const stockName = sellTrade.stock_name;

  const openLots = await getOpenLots(stockName, sortCriteria);

  // Check if any open lots exist
  if (openLots.length === 0) {
    throw new Error(`No open lots found for stock: ${stockName}`);
  }

  // Calculate total available quantity across all lots
  const totalAvailable = openLots.reduce(
    (sum, lot) => sum + (lot.lot_quantity - lot.realized_quantity),
    0
  );

  // Validate sufficient quantity exists
  if (totalAvailable < sellQuantity) {
    throw new Error(
      `Not enough shares to sell. Requested: ${sellQuantity}, Available: ${totalAvailable}`
    );
  }

  const updatedLots = [];

  // Process each lot until sell quantity is fulfilled
  for (const lot of openLots) {
    if (remainingSellQuantity <= 0) break;

    const availableQuantity = lot.lot_quantity - lot.realized_quantity;
    const realizedQuantity = Math.min(availableQuantity, remainingSellQuantity);

    // Update lot details
    lot.realized_quantity += realizedQuantity;
    lot.realized_trade_id.push(sellTrade._id);

    // Update lot status based on realization
    lot.lot_status =
      lot.realized_quantity === lot.lot_quantity
        ? "FULLY_REALIZED"
        : lot.realized_quantity > 0
        ? "PARTIALLY_REALIZED"
        : "OPEN";

    await lot.save();
    updatedLots.push(lot);

    // Reduce remaining quantity to sell
    remainingSellQuantity -= realizedQuantity;
  }

  // Get remaining open lots after realization
  const openLotsAfterSell = await getOpenLots(stockName, sortCriteria);

  // Calculate remaining quantity after sale
  const remainingQuantity = openLotsAfterSell.reduce(
    (sum, lot) => sum + (lot.lot_quantity - lot.realized_quantity),
    0
  );

  return {
    soldQuantity: sellQuantity,
    remainingQuantity,
    updatedLots,
  };
};

/**
 * Realizes lots using FIFO (First-In-First-Out) method
 * @param {object} sellTrade - The sell trade document
 * @returns {Promise<object>} Realization results
 */

export const realizeLotsFIFO = async (sellTrade) => {
  return realizeLots(sellTrade, { createdAt: 1 });
};

/**
 * Realizes lots using LIFO (Last-In-First-Out) method
 * @param {object} sellTrade - The sell trade document
 * @returns {Promise<object>} Realization results
 */

export const realizeLotsLIFO = async (sellTrade) => {
  return realizeLots(sellTrade, { createdAt: -1 });
};
