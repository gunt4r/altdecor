# Step 1: Build stage using Maven with Java 17
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom and pre-fetch dependencies for better caching
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# Step 2: Runtime stage with JRE only
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/target/zipflow-server.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
