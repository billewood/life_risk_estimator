# R Service Dockerfile for PREVENT Calculator
FROM rocker/r-ver:4.3.0

# Install system dependencies for plumber
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages - with verbose output to debug
RUN R -e "options(repos = c(CRAN = 'https://cloud.r-project.org')); install.packages('plumber', dependencies = TRUE); install.packages('preventr', dependencies = TRUE)"

# Verify packages installed
RUN R -e "library(plumber); library(preventr); cat('Packages loaded successfully\n')"

# Copy API files
WORKDIR /app
COPY api.R .
COPY run.R .

# Expose port (Railway uses PORT env var)
EXPOSE 8000

# Run the API
CMD ["Rscript", "run.R"]
