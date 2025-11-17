const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

require("dotenv").config();

const Item = require("./models/Item");
const User = require("./models/User");

const mongoUri = process.env.MONGO_URI;

const sampleItems = [
  {
    itemName: "Robotic Arm",
    ownerId: "2023AIB1017",
    totalQuantity: 15,
    availableQuantity: 10,
  },
  {
    itemName: "Servo Motor",
    ownerId: "2023AIB1011",
    totalQuantity: 30,
    availableQuantity: 25,
  },
  {
    itemName: "Ultrasonic Sensor",
    ownerId: "2023AIB1019",
    totalQuantity: 20,
    availableQuantity: 20,
  },
  {
    itemName: "Microcontroller Board",
    ownerId: "2023AIB1101",
    totalQuantity: 50,
    availableQuantity: 45,
  },
];

async function seedDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    pass1 = await bcrypt.hash("hello", 10);
    pass2 = await bcrypt.hash("byebye", 10);

    const sampleUsers = [
      {
        username: "Vedant",
        password: pass1,
      },
      {
        username: "Shubham",
        password: pass2,
      },
    ];

    // Optional: Clear existing data (uncomment if needed)
    // await Item.deleteMany({});

    // await Item.insertMany(sampleItems);
    // console.log("Sample items inserted");

    await User.insertMany(sampleUsers);
    console.log("Sample users inserted");

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Error seeding data:", err);
  }
}

seedDB();
