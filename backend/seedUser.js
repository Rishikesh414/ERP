// backend/seedSample.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Institution } from "./models/Institution.js";
import { Branch } from "./models/Branch.js";
import { Student } from "./models/Student.js";
import { FeePayment } from "./models/FeePayment.js";
import { InventoryItem, PurchaseEntry } from "./models/inventory.js";

dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/first-crop_db";

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("Mongo connected for seeding");

  await Promise.all([
    User.deleteMany({}),
    Institution.deleteMany({}),
    Branch.deleteMany({}),
    Student.deleteMany({}),
    FeePayment.deleteMany({}),
    InventoryItem.deleteMany({}),
    PurchaseEntry.deleteMany({}),
  ]);

  const companyAdmin = new User({
    name: "Company Admin",
    email: "company@erp.com",
    role: "company_admin",
    status: "active",
  });
  await companyAdmin.setPassword("Admin@123");
  await companyAdmin.save();

  const institution = new Institution({
    name: "Ematix Public School",
    institution_id: "INST001",
    location: "Main Road, Chennai",
  });
  await institution.save();

  const instAdmin = new User({
    name: "Institution Admin",
    email: "inst@ematix.com",
    role: "institution_admin",
    status: "active",
    institution_id: institution._id,
  });
  await instAdmin.setPassword("Admin@123");
  await instAdmin.save();

  const branch1 = new Branch({
    institution_id: institution._id,
    branch_name: "Ematix - Chrompet",
    address: "Chrompet, Chennai",
    location: "Chrompet",
    managerName: "Branch Manager 1",
    managerEmail: "bm1@ematix.com",
    contactPhone: "9876543210",
    classes: ["LKG", "UKG", "1st Std", "2nd Std"],
    feesText: "LKG:20000, UKG:21000, 1st Std:25000, 2nd Std:26000",
  });
  await branch1.save();

  const branch2 = new Branch({
    institution_id: institution._id,
    branch_name: "Ematix - Tambaram",
    address: "Tambaram, Chennai",
    location: "Tambaram",
    managerName: "Branch Manager 2",
    managerEmail: "bm2@ematix.com",
    contactPhone: "9876500000",
    classes: ["1st Std", "2nd Std", "3rd Std"],
    feesText: "1st Std:24000, 2nd Std:25500, 3rd Std:27000",
  });
  await branch2.save();

  const branchAdmin1 = new User({
    name: "Branch Admin 1",
    email: branch1.managerEmail,
    role: "branch_admin",
    status: "active",
    institution_id: institution._id,
    branch_id: branch1._id,
  });
  await branchAdmin1.setPassword("Branch@123");
  await branchAdmin1.save();

  const branchAdmin2 = new User({
    name: "Branch Admin 2",
    email: branch2.managerEmail,
    role: "branch_admin",
    status: "active",
    institution_id: institution._id,
    branch_id: branch2._id,
  });
  await branchAdmin2.setPassword("Branch@123");
  await branchAdmin2.save();

  // Add staff for branch1
  const staff1 = new User({
    name: "Staff Member 1",
    email: "staff1@ematix.com",
    phone: "9876543218",
    age: 30,
    address: "123 Staff Quarters, Chrompet, Chennai",
    location: "Chrompet",
    staffCategory: "teaching",
    role: "staff",
    status: "active",
    institution_id: institution._id,
    branch_id: branch1._id,
  });
  await staff1.setPassword("Staff@123");
  await staff1.save();

  const staff2 = new User({
    name: "Staff Member 2",
    email: "staff2@ematix.com",
    phone: "9876543219",
    age: 28,
    address: "456 Staff Colony, Chrompet, Chennai",
    location: "Chrompet",
    staffCategory: "non-teaching",
    role: "staff",
    status: "active",
    institution_id: institution._id,
    branch_id: branch1._id,
  });
  await staff2.setPassword("Staff@123");
  await staff2.save();

  const studentsB1 = [
    {
      name: "Rahul Sharma",
      class: "1",
      section: "A",
      rollNo: "1",
      parentName: "Vijay Sharma",
      phoneNo: "9876543210",
      address: "123 Main Street, Chrompet, Chennai - 600044",
      admissionNumber: "202425-0001",
      academicYear: "2024/25",
      status: "active"
    },
    {
      name: "Priya Patel",
      class: "1",
      section: "A",
      rollNo: "2",
      parentName: "Rajesh Patel",
      phoneNo: "9876543211",
      address: "456 Oak Avenue, Chrompet, Chennai - 600044",
      admissionNumber: "202425-0002",
      academicYear: "2024/25",
      status: "active"
    },
    {
      name: "Arun Kumar",
      class: "2",
      section: "B",
      rollNo: "1",
      parentName: "Suresh Kumar",
      phoneNo: "9876543212",
      address: "789 Pine Road, Chrompet, Chennai - 600044",
      admissionNumber: "202425-0003",
      academicYear: "2024/25",
      status: "active"
    },
    {
      name: "Sneha Reddy",
      class: "2",
      section: "B",
      rollNo: "2",
      parentName: "Kiran Reddy",
      phoneNo: "9876543213",
      address: "321 Elm Street, Chrompet, Chennai - 600044",
      admissionNumber: "202425-0004",
      academicYear: "2024/25",
      status: "active"
    },
    {
      name: "Karthik Nair",
      class: "1",
      section: "A",
      rollNo: "3",
      parentName: "Mohan Nair",
      phoneNo: "9876543214",
      address: "654 Cedar Lane, Chrompet, Chennai - 600044",
      admissionNumber: "202425-0005",
      academicYear: "2024/25",
      status: "left"
    }
  ].map(
    (s) =>
      new Student({
        ...s,
        institution_id: institution._id,
        branch_id: branch1._id,
      })
  );
  await Student.insertMany(studentsB1);

  const studentsB2 = [
    {
      name: "Meera Singh",
      class: "1",
      section: "A",
      rollNo: "1",
      parentName: "Amit Singh",
      phoneNo: "9876543215",
      address: "111 Maple Street, Tambaram, Chennai - 600045",
      admissionNumber: "202425-0006",
      academicYear: "2024/25",
      status: "active"
    },
    {
      name: "Vikram Joshi",
      class: "2",
      section: "A",
      rollNo: "1",
      parentName: "Deepak Joshi",
      phoneNo: "9876543216",
      address: "222 Birch Avenue, Tambaram, Chennai - 600045",
      admissionNumber: "202425-0007",
      academicYear: "2024/25",
      status: "active"
    },
    {
      name: "Anjali Gupta",
      class: "3",
      section: "A",
      rollNo: "1",
      parentName: "Raj Gupta",
      phoneNo: "9876543217",
      address: "333 Willow Road, Tambaram, Chennai - 600045",
      admissionNumber: "202425-0008",
      academicYear: "2024/25",
      status: "transferred"
    }
  ].map(
    (s) =>
      new Student({
        ...s,
        institution_id: institution._id,
        branch_id: branch2._id,
      })
  );
  await Student.insertMany(studentsB2);

  const feesB1 = [
    { studentName: "Rahul Sharma", amount: 25000 },
    { studentName: "Priya Patel", amount: 25000 },
    { studentName: "Arun Kumar", amount: 26000 },
    { studentName: "Sneha Reddy", amount: 26000 },
  ].map(
    (f) =>
      new FeePayment({
        studentName: f.studentName,
        amount: f.amount,
        institution_id: institution._id,
        branch_id: branch1._id,
      })
  );
  await FeePayment.insertMany(feesB1);

  const feesB2 = [
    { studentName: "Meera Singh", amount: 24000 },
    { studentName: "Vikram Joshi", amount: 25500 },
  ].map(
    (f) =>
      new FeePayment({
        studentName: f.studentName,
        amount: f.amount,
        institution_id: institution._id,
        branch_id: branch2._id,
      })
  );
  await FeePayment.insertMany(feesB2);

  // Add inventory items for branch1
  const inventoryItemsB1 = [];
  const item1 = new InventoryItem({
    branch_id: branch1._id,
    category: "uniforms",
    name: "School Uniform Set",
    description: "Complete uniform set for students",
    currentStock: 50,
    minQuantity: 10,
    unit: "sets",
  });
  await item1.save();
  inventoryItemsB1.push(item1);

  const item2 = new InventoryItem({
    branch_id: branch1._id,
    category: "books",
    name: "Mathematics Textbook",
    description: "Grade 1 Mathematics textbook",
    currentStock: 25,
    minQuantity: 5,
    unit: "books",
  });
  await item2.save();
  inventoryItemsB1.push(item2);

  const item3 = new InventoryItem({
    branch_id: branch1._id,
    category: "stationery",
    name: "Notebooks",
    description: "A4 size notebooks",
    currentStock: 100,
    minQuantity: 20,
    unit: "pieces",
  });
  await item3.save();
  inventoryItemsB1.push(item3);

  const item4 = new InventoryItem({
    branch_id: branch1._id,
    category: "shoes",
    name: "School Shoes",
    description: "Black school shoes",
    currentStock: 15,
    minQuantity: 5,
    unit: "pairs",
  });
  await item4.save();
  inventoryItemsB1.push(item4);

  // Add purchase entries
  const purchasesB1 = [
    {
      branch_id: branch1._id,
      item_id: inventoryItemsB1[0]._id,
      quantity: 50,
      supplierName: "Uniform Suppliers Ltd",
      invoiceNumber: "INV001",
      purchaseDate: new Date("2024-01-15"),
      notes: "Initial stock purchase",
    },
    {
      branch_id: branch1._id,
      item_id: inventoryItemsB1[1]._id,
      quantity: 30,
      supplierName: "Book Publishers Inc",
      invoiceNumber: "INV002",
      purchaseDate: new Date("2024-01-20"),
      notes: "Textbook delivery",
    },
  ];
  await PurchaseEntry.insertMany(purchasesB1);

  console.log("Seed data inserted:");
  console.log("- company admin: company@erp.com / Admin@123");
  console.log("- institution admin: inst@ematix.com / Admin@123");
  console.log("- branch admin 1: bm1@ematix.com / Branch@123");
  console.log("- branch admin 2: bm2@ematix.com / Branch@123");
  console.log("- staff 1: staff1@ematix.com / Staff@123");
  console.log("- staff 2: staff2@ematix.com / Staff@123");
  console.log("- inventory items added for branch 1");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("SEED ERROR", err);
  process.exit(1);
});
// dont use this 
