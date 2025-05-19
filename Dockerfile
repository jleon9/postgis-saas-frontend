# Use a Node.js 20 base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the Next.js application source code
COPY . .

RUN npx zenstack generate

RUN npx prisma db push

RUN npx prisma db seed

# Build the Next.js application for production
RUN yarn run build

# Expose the port that Next.js uses (default: 3000)
EXPOSE 3000

# Set the startup command to run the Next.js server in production mode
CMD ["yarn", "start"]