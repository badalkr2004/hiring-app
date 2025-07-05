const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock users data
const mockUsers = [
  {
    id: "1",
    email: "admin@jobflow.com",
    firstName: "Super",
    lastName: "Admin",
    role: "admin",
    createdAt: "2024-01-01",
    isActive: true,
    location: "San Francisco, CA",
  },
  {
    id: "2",
    email: "company@techflow.com",
    firstName: "Tech",
    lastName: "Flow",
    role: "company",
    createdAt: "2024-01-15",
    isActive: true,
    location: "San Francisco, CA",
  },
  {
    id: "3",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "user",
    createdAt: "2024-02-01",
    isActive: true,
    location: "New York, NY",
    skills: ["React", "TypeScript", "Node.js"],
    experience: "5 years",
  },
];

const mockCompanies = [
  {
    id: "1",
    name: "TechFlow Inc.",
    email: "company@techflow.com",
    description: "Leading technology company focused on innovation",
    website: "https://techflow.com",
    size: "50-200",
    industry: "Technology",
    location: "San Francisco, CA",
    foundedYear: 2020,
    verified: true,
    createdAt: "2024-01-15",
    jobsPosted: 12,
  },
];

export const authService = {
  async login(email, password) {
    

    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    return {
      user,
      token: `mock-token-${user.id}`,
    };
  },

  async signup(userData) {
    await delay(1000);

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // If company signup, create company record
    if (userData.role === "company" && userData.companyName) {
      const newCompany = {
        id: newUser.id,
        name: userData.companyName,
        email: userData.email,
        description: "",
        size: userData.companySize || "",
        industry: userData.industry || "",
        location: "",
        verified: false,
        createdAt: new Date().toISOString(),
        jobsPosted: 0,
      };
      mockCompanies.push(newCompany);
    }

    mockUsers.push(newUser);

    return {
      user: newUser,
      token: `mock-token-${newUser.id}`,
    };
  },

  async getCurrentUser() {
    await delay(300);
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const userId = token.replace("mock-token-", "");
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async getAllUsers() {
    await delay(500);
    return mockUsers.filter((u) => u.role !== "admin");
  },

  async getAllCompanies() {
    await delay(500);
    return mockCompanies;
  },

  async updateUserStatus(userId, isActive) {
    await delay(300);
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      user.isActive = isActive;
    }
  },

  async verifyCompany(companyId) {
    await delay(300);
    const company = mockCompanies.find((c) => c.id === companyId);
    if (company) {
      company.verified = true;
    }
  },
};
