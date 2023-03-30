const prompt = require("prompt-sync")();
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

function promptForInfo(promptText, validatorFn, failPrompt) {
  let value = null;
  console.log(promptText);
  while (value === null) {
    // If prompt is interrupted by sigint, it returns null
    const userInput = prompt();
    if (userInput === null) {
      process.exit();
    }
    const success = validatorFn(userInput);
    value = success ? userInput : null;
    if (value === null) {
      console.log(failPrompt)
    }
  }
  return value;
}

const email = promptForInfo(
  "Enter new email",
  (userInput) => z.string().email().safeParse(userInput).success,
  "Invalid format for email, try again",
)

const password = promptForInfo(
  "Enter new password",
  (userInput) => z.string().min(6).safeParse(userInput).success,
  "Password must be at least 6 characters long",
)

let prisma = new PrismaClient();

async function createUser(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      role: "ADMIN",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

createUser(email, password);
