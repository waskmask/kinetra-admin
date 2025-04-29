const Storage = require("../modals/Storage");
const AdminUser = require("../modals/AdminUser");

// Create a new storage
exports.createStorage = async (req, res) => {
  const { name, address, users } = req.body;

  if (
    !name ||
    !address?.street_address ||
    !address?.postal_code ||
    !address?.city
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Validate admin users
  let validUsers = [];
  if (Array.isArray(users) && users.length > 0) {
    validUsers = await AdminUser.find({
      _id: { $in: users },
      isActive: true,
    }).select("_id");
  }

  const newStorage = await Storage.create({
    name,
    address,
    users: validUsers.map((u) => u._id),
  });

  res.status(201).json({ message: "Storage created", storage: newStorage });
};

// Update an existing storage
exports.updateStorage = async (req, res) => {
  const { name, address, users, isActive } = req.body;
  const { id } = req.params;

  const storage = await Storage.findById(id);
  if (!storage) return res.status(404).json({ message: "Storage not found" });

  if (name) storage.name = name;
  if (typeof isActive === "boolean") storage.isActive = isActive;

  if (address) {
    storage.address = {
      ...storage.address,
      ...address,
    };
  }

  if (Array.isArray(users)) {
    const validUsers = await AdminUser.find({
      _id: { $in: users },
      isActive: true,
    }).select("_id");
    storage.users = validUsers.map((u) => u._id);
  }

  await storage.save();

  res.json({ message: "Storage updated", storage });
};

// Optional: Get all storages (with user and product info)
exports.getAllStorages = async (req, res) => {
  const storages = await Storage.find()
    .populate("users", "name email role")
    .populate("products.product_id", "product_name product_grade unit_type")
    .sort({ createdAt: -1 });

  res.json(storages);
};

// Optional: Get a single storage by ID
exports.getStorageById = async (req, res) => {
  const { id } = req.params;

  const storage = await Storage.findById(id)
    .populate("users", "name email role")
    .populate("products.product_id", "product_name product_grade unit_type");

  if (!storage) {
    return res.status(404).json({ message: "Storage not found" });
  }

  res.json(storage);
};
