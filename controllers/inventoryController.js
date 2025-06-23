// controllers/inventoryController.js
const Storage = require("../modals/Storage");
const Product = require("../modals/Product");

// Add inventory to a storage
exports.addInventoryToStorage = async (req, res) => {
  const { id } = req.params; // storage ID
  const { product_id, quantity, action } = req.body;
  const adminUserId = req.user._id;

  const allowedActions = ["added", "held", "removed", "dispatched", "release"];

  if (
    !product_id ||
    !quantity ||
    quantity <= 0 ||
    !allowedActions.includes(action)
  ) {
    return res.status(400).json({ message: "invalid_input" });
  }

  const storage = await Storage.findById(id);
  if (!storage) return res.status(404).json({ message: "storage_not_found" });

  const product = await Product.findById(product_id);
  if (!product) return res.status(404).json({ message: "product_not_found" });

  const productInStorage = storage.products.find((p) =>
    p.product_id.equals(product_id)
  );

  const logEntry = {
    quantity,
    action,
    performed_by: adminUserId,
  };

  if (productInStorage) {
    switch (action) {
      case "added":
        productInStorage.quantity += quantity;
        break;

      case "held":
        if (productInStorage.quantity < quantity) {
          return res.status(400).json({ message: "not_enough_stock_to_hold" });
        }
        productInStorage.quantity -= quantity;
        productInStorage.held_quantity =
          (productInStorage.held_quantity || 0) + quantity;
        break;

      case "removed":
        if (productInStorage.quantity < quantity) {
          return res
            .status(400)
            .json({ message: "not_enough_stock_to_remove" });
        }
        productInStorage.quantity -= quantity;
        break;

      case "dispatched":
        if ((productInStorage.held_quantity || 0) < quantity) {
          return res
            .status(400)
            .json({ message: "not_enough_held_stock_to_dispatch" });
        }
        productInStorage.held_quantity -= quantity;
        break;

      case "release":
        if ((productInStorage.held_quantity || 0) < quantity) {
          return res
            .status(400)
            .json({ message: "not_enough_held_stock_to_release" });
        }
        productInStorage.held_quantity -= quantity;
        productInStorage.quantity += quantity;
        break;
    }

    productInStorage.inventory.push(logEntry);
  } else {
    if (action !== "added") {
      return res
        .status(400)
        .json({ message: "Product not in storage yet. Use 'added' first." });
    }

    storage.products.push({
      product_id,
      quantity,
      held_quantity: 0,
      inventory: [logEntry],
    });
  }

  await storage.save();

  res
    .status(200)
    .json({ success: true, message: `Inventory ${action}`, storage });
};

// soft delete inventory from a storage
exports.softDeleteInventoryLog = async (req, res) => {
  const { storageId, productId, inventoryId } = req.params;
  const adminUserId = req.user._id;

  const storage = await Storage.findById(storageId);
  if (!storage) return res.status(404).json({ message: "storage_not_found" });

  const productEntry = storage.products.find((p) =>
    p.product_id.equals(productId)
  );

  if (!productEntry) {
    return res.status(404).json({ message: "product_not_found_in_storage" });
  }

  const logEntry = productEntry.inventory.id(inventoryId);

  if (
    !logEntry ||
    logEntry.deleted ||
    ["removed", "dispatched"].includes(logEntry.action)
  ) {
    return res
      .status(400)
      .json({ message: "this_inventory_log_cannot_be_deleted" });
  }

  const { quantity: logQty } = logEntry;
  const { quantity, held_quantity = 0 } = productEntry;

  // 🔐 Prevent available quantity from dropping below held stock
  if (quantity - logQty < held_quantity) {
    return res.status(400).json({
      message: "cannot_delete_this_inventory_stock_would_exceed",
    });
  }

  // 🟢 Soft delete
  logEntry.deleted = true;
  logEntry.action = "removed";
  logEntry.timestamp = new Date();
  logEntry.performed_by = adminUserId;

  productEntry.quantity -= logQty;

  await storage.save();

  res.json({ success: true, message: "Inventory log soft-deleted", storage });
};

// get all inventory overview
exports.getInventoryOverview = async (req, res) => {
  const storages = await Storage.find({})
    .populate(
      "products.product_id",
      "product_name product_grade unit_type product_id"
    )
    .select("name products");

  const result = [];

  storages.forEach((storage) => {
    storage.products.forEach((productEntry) => {
      const { product_id, quantity, held_quantity, inventory } = productEntry;

      const available_quantity = quantity - (held_quantity || 0);
      const logActions = inventory.map((log) =>
        log.deleted ? "deleted" : log.action
      );

      result.push({
        _id: product_id._id,
        product_id: product_id.product_id,
        product_name: product_id.product_name,
        product_grade: product_id.product_grade,
        unit_type: product_id.unit_type,
        storage_id: storage._id,
        storage_name: storage.name,
        quantity,
        held_quantity: held_quantity || 0,
        available_quantity,
      });
    });
  });

  res.json({ success: true, data: result });
};

// get inventory logs by product from a specific storage
exports.getInventoryLogsByProductFromStorage = async (req, res) => {
  const { storageId, productId } = req.params;

  const storage = await Storage.findById(storageId)
    .populate(
      "products.product_id",
      "product_name unit_type product_grade product_id _id"
    )
    .populate("products.inventory.performed_by", "name email role _id")
    .select("name products");

  if (!storage) {
    return res.status(404).json({ message: "Storage not found" });
  }

  const productEntry = storage.products.find(
    (p) => p.product_id && p.product_id._id.toString() === productId
  );

  if (!productEntry) {
    return res
      .status(404)
      .json({ message: "Product not found in this storage" });
  }

  const logs = productEntry.inventory.map((log) => ({
    _id: log._id,
    action: log.deleted ? "deleted" : log.action,
    quantity: log.quantity,
    timestamp: log.timestamp,
    performed_by: log.performed_by?.name || "N/A",
    email: log.performed_by?.email || "N/A",
    role: log.performed_by?.role || "N/A",
    p_id: log.performed_by?._id || "N/A",
  }));

  res.json({
    success: true,
    product_id: productEntry.product_id.product_id,
    product_name: productEntry.product_id.product_name,
    unit_type: productEntry.product_id.unit_type,
    product_grade: productEntry.product_id.product_grade,
    _id: productEntry.product_id._id,
    storage_id: storage._id,
    storage_name: storage.name,
    quantity: productEntry.quantity || 0,
    held_quantity: productEntry.held_quantity || 0,
    available_quantity:
      (productEntry.quantity || 0) - (productEntry.held_quantity || 0),
    logs: logs.reverse(), // latest first
  });
};

// get inventory by storage ID
exports.getInventoryByStorageId = async (req, res) => {
  const { storageId } = req.params;

  const storage = await Storage.findById(storageId)
    .populate("products.product_id", "product_name unit_type")
    .select("name products");

  if (!storage) {
    return res.status(404).json({ message: "Storage not found" });
  }

  const result = storage.products.map((productEntry) => {
    const { product_id, quantity, held_quantity, inventory } = productEntry;

    const available_quantity = quantity - (held_quantity || 0);
    const logActions = inventory.map((log) =>
      log.deleted ? "deleted" : log.action
    );

    return {
      product_id:
        typeof product_id === "object" && product_id._id
          ? product_id._id.toString()
          : product_id,
      product_name: product_id?.product_name || "N/A",
      unit_type: product_id?.unit_type || "N/A",
      quantity,
      held_quantity: held_quantity || 0,
      available_quantity,
      log: [...new Set(logActions.reverse())],
    };
  });

  res.json({
    success: true,
    storage_id: storage._id,
    storage_name: storage.name,
    data: result,
  });
};
