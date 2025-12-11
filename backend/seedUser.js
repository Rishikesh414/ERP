const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URL = "mongodb://127.0.0.1:27017/first-crop_db";

async function createUserIfMissing(data) {
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: "active"
    });
    await user.setPassword("Admin@123");
    await user.save();
    console.log("Created user:", data.email, "role:", data.role);
  } else {
    console.log("User already exists:", data.email);
  }
}

async function main() {
  await mongoose.connect(MONGO_URL);

  await createUserIfMissing({
    name: "Company Admin",
    email: "companyadmin@erp.com",
    phone: "9000000001",
    role: "super_admin"
  });

  await createUserIfMissing({
    name: "Institution Admin",
    email: "instadmin@erp.com",
    phone: "9000000002",
    role: "institution_admin"
  });

  await createUserIfMissing({
    name: "Branch Admin",
    email: "branchadmin@erp.com",
    phone: "9000000003",
    role: "branch_admin"
  });

  await createUserIfMissing({
    name: "Staff User",
    email: "staff@erp.com",
    phone: "9000000004",
    role: "staff"
  });

  await createUserIfMissing({
    name: "Parent User",
    email: "parent@erp.com",
    phone: "9000000005",
    role: "parent"
  });

  await mongoose.disconnect();
  console.log("Done seeding users.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
