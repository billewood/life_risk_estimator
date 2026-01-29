# R Service Dockerfile for PREVENT Calculator
FROM rocker/r-ver:4.3.0

# Install system dependencies for plumber
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c('plumber', 'preventr'), repos='https://cran.rstudio.com/')"

# Copy API files
WORKDIR /app
COPY api.R .
COPY run.R .

# Expose port
EXPOSE 8000

# Run the API
CMD ["Rscript", "run.R"]
