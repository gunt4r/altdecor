FROM openjdk:17
# Set the working directory in the container
WORKDIR /app

# Copy the jar file into the container at /app
COPY target/zipflow-server.jar /app/app.jar
ENTRYPOINT [ "java", "-jar","app.jar" ]        