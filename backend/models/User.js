import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePicture: {
      type: String,
      default: "",
    },
    bannerImg: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "AlumnLink User",
    },
    location: {
      type: String,
      enum: [
        "Bengaluru",
        "Hyderabad",
        "Pune",
        "Chennai",
        "Mumbai",
        "Delhi NCR",
        "Kolkata",
        "Ahmedabad",
        "Jaipur",
        "Thiruvananthapuram",
        "Lucknow",
        "Indore",
        "Chandigarh",
        "Nagpur",
      ],
    },
    about: {
      type: String,
      default: "",
    },
    skills: [String],
    experience: [
      {
        _id: String,
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        isCurrentlyStudying: Boolean,
        description: String,
        _id: String,
      },
    ],
    Links: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    role: {
      type: String,
      enum: ["admin", "superadmin", "user"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    adminType: {
      type: String,
      enum: ["institute", "corporate", "school"],
      required: function () {
        return this.role === "admin";
      },
      default: undefined,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: undefined,
    },
    assignedCourses: {
      type: [String],
      default: [],
      required: function () {
        return false;
      },
    },
    activityHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        activities: {
          posts: { type: Number, default: 0 },
          likes: { type: Number, default: 0 },
          comments: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
