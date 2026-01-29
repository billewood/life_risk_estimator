# Start the Plumber API server
library(plumber)

# Get port from environment variable (for cloud deployment) or default to 8000
port <- as.integer(Sys.getenv("PORT", "8000"))

# Load and run the API
pr("api.R") %>%
  pr_run(host = "0.0.0.0", port = port)
